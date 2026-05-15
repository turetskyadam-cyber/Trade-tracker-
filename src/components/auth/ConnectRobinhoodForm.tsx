'use client';
import { useState, useRef, useEffect } from 'react';
import { getOrCreateDeviceToken } from '@/lib/robinhood/auth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type Step = 'credentials' | 'mfa' | 'challenge' | 'loading' | 'error';

interface Props {
  onConnected: () => void;
}

export function ConnectRobinhoodForm({ onConnected }: Props) {
  const [step, setStep] = useState<Step>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [challengeCode, setChallengeCode] = useState('');
  const [mfaType, setMfaType] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [challengeType, setChallengeType] = useState('');
  const [error, setError] = useState('');
  const mfaRef = useRef<HTMLInputElement>(null);
  const challengeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'mfa') mfaRef.current?.focus();
    if (step === 'challenge') challengeRef.current?.focus();
  }, [step]);

  const isLoading = step === 'loading';

  async function storeToken(access_token: string, refresh_token: string, expires_in: number) {
    const device_token = getOrCreateDeviceToken();
    const res = await fetch('/api/tokens/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token, refresh_token, expires_in, device_token }),
    });
    return res.ok;
  }

  async function doAuth(extraFields: Record<string, string> = {}, extraHeaders: Record<string, string> = {}) {
    const device_token = getOrCreateDeviceToken();
    const res = await fetch('/api/robinhood/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, device_token, ...extraFields }),
    });
    return { res, data: await res.json() };
  }

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setError('');
    try {
      const { data } = await doAuth();
      if (data.mfa_required) {
        setMfaType(data.mfa_type ?? '');
        setStep('mfa');
      } else if (data.challenge_required) {
        setChallengeId(data.challenge_id);
        setChallengeType(data.challenge_type);
        setStep('challenge');
      } else if (data.access_token) {
        const ok = await storeToken(data.access_token, data.refresh_token, data.expires_in);
        if (ok) onConnected();
        else { setError('Failed to save connection. Try again.'); setStep('error'); }
      } else {
        setError(data.error ?? 'Login failed');
        setStep('error');
      }
    } catch {
      setError('Network error. Please try again.');
      setStep('error');
    }
  };

  const handleMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setError('');
    try {
      const { data } = await doAuth({ mfa_code: mfaCode });
      if (data.access_token) {
        const ok = await storeToken(data.access_token, data.refresh_token, data.expires_in);
        if (ok) onConnected();
        else { setError('Failed to save connection.'); setStep('mfa'); }
      } else {
        setError(data.error ?? 'Invalid code');
        setStep('mfa');
      }
    } catch {
      setError('Network error.'); setStep('mfa');
    }
  };

  const handleChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setError('');
    try {
      // Respond to SMS/email challenge
      const respondRes = await fetch('/api/robinhood/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge_id: challengeId, code: challengeCode }),
      });
      const respondData = await respondRes.json();
      if (respondData.error) { setError(respondData.error); setStep('challenge'); return; }

      // Re-auth with challenge response ID
      const { data } = await doAuth({ challenge_response_id: challengeId });
      if (data.access_token) {
        const ok = await storeToken(data.access_token, data.refresh_token, data.expires_in);
        if (ok) onConnected();
        else { setError('Failed to save connection.'); setStep('challenge'); }
      } else {
        setError(data.error ?? 'Verification failed');
        setStep('challenge');
      }
    } catch {
      setError('Network error.'); setStep('challenge');
    }
  };

  return (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-400">
      {/* Step: credentials */}
      {(step === 'credentials' || step === 'loading' || step === 'error') && (
        <form onSubmit={handleCredentials} className="flex flex-col gap-4">
          <div className="rounded-xl bg-amber-950/30 border border-amber-800/50 px-4 py-3 text-sm text-amber-300">
            Your Robinhood credentials are used <strong>once</strong> to get a secure token.
            They are never stored — only an encrypted token is saved.
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Robinhood Email</label>
            <input type="text" autoComplete="username" value={username}
              onChange={(e) => setUsername(e.target.value)} required disabled={isLoading}
              className="rounded-xl bg-gray-900 border border-gray-700 focus:border-amber-500 px-4 py-3 text-white text-sm outline-none transition-colors duration-150 disabled:opacity-50"
              placeholder="you@example.com" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Robinhood Password</label>
            <input type="password" autoComplete="current-password" value={password}
              onChange={(e) => setPassword(e.target.value)} required disabled={isLoading}
              className="rounded-xl bg-gray-900 border border-gray-700 focus:border-amber-500 px-4 py-3 text-white text-sm outline-none transition-colors duration-150 disabled:opacity-50"
              placeholder="••••••••" />
          </div>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <button type="submit" disabled={isLoading || !username || !password}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
            {isLoading && <LoadingSpinner size={16} />}
            {isLoading ? 'Connecting…' : 'Connect Robinhood'}
          </button>
        </form>
      )}

      {/* Step: MFA */}
      {step === 'mfa' && (
        <form onSubmit={handleMfa} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-sm text-gray-400 text-center">
            {mfaType === 'app' ? 'Enter your authenticator app code.' : `Enter the code sent to your ${mfaType || 'device'}.`}
          </p>
          <input ref={mfaRef} type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
            value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))} required
            className="text-center text-3xl tracking-[0.4em] rounded-xl bg-gray-900 border border-gray-700 focus:border-amber-500 px-4 py-4 text-white outline-none transition-colors font-mono"
            placeholder="_ _ _ _ _ _" />
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <button type="submit" disabled={mfaCode.length !== 6}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40">
            Verify
          </button>
        </form>
      )}

      {/* Step: SMS/email challenge */}
      {step === 'challenge' && (
        <form onSubmit={handleChallenge} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-sm text-gray-400 text-center">
            Robinhood sent a code to your {challengeType === 'sms' ? 'phone' : 'email'}.
          </p>
          <input ref={challengeRef} type="text" inputMode="numeric" maxLength={6}
            value={challengeCode} onChange={(e) => setChallengeCode(e.target.value.replace(/\D/g, ''))} required
            className="text-center text-3xl tracking-[0.4em] rounded-xl bg-gray-900 border border-gray-700 focus:border-amber-500 px-4 py-4 text-white outline-none transition-colors font-mono"
            placeholder="_ _ _ _ _ _" />
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <button type="submit" disabled={challengeCode.length < 4}
            className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40">
            Verify
          </button>
        </form>
      )}
    </div>
  );
}
