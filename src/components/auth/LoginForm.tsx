'use client';
import { useState, useRef, useEffect } from 'react';
import { useRobinhoodAuth } from '@/hooks/useRobinhoodAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface LoginFormProps {
  onAuthenticated: (token: string) => void;
}

export function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [challengeCode, setChallengeCode] = useState('');

  const mfaRef = useRef<HTMLInputElement>(null);
  const challengeRef = useRef<HTMLInputElement>(null);

  const {
    step,
    mfaType,
    challengeId,
    challengeType,
    error,
    token,
    login,
    submitMfa,
    respondToChallenge,
  } = useRobinhoodAuth();

  useEffect(() => {
    if (step === 'mfa') mfaRef.current?.focus();
    if (step === 'challenge') challengeRef.current?.focus();
    if (step === 'authenticated' && token) onAuthenticated(token);
  }, [step, token, onAuthenticated]);

  const isLoading = step === 'loading';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password);
  };

  const handleMfa = (e: React.FormEvent) => {
    e.preventDefault();
    submitMfa(username, password, mfaCode);
  };

  const handleChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;
    respondToChallenge(username, password, challengeId, challengeCode);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-400 w-full max-w-sm">
      {/* Step 1: Credentials */}
      {(step === 'idle' || step === 'loading' || step === 'error') && (
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              Email or Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
              className="rounded-xl bg-gray-900 border border-gray-700 focus:border-indigo-500 px-4 py-3 text-white text-sm outline-none transition-colors duration-150 placeholder:text-gray-600 disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="rounded-xl bg-gray-900 border border-gray-700 focus:border-indigo-500 px-4 py-3 text-white text-sm outline-none transition-colors duration-150 placeholder:text-gray-600 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center animate-in fade-in duration-200">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            {isLoading ? <LoadingSpinner size={16} /> : null}
            {isLoading ? 'Connecting…' : 'Connect Account'}
          </button>

          <p className="text-center text-xs text-gray-600 leading-relaxed">
            Your credentials are sent directly to Robinhood and never stored.
            Only your session token is saved locally.
          </p>
        </form>
      )}

      {/* Step 2: MFA */}
      {step === 'mfa' && (
        <form onSubmit={handleMfa} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              {mfaType === 'app'
                ? 'Enter the 6-digit code from your authenticator app.'
                : `Enter the code sent to your ${mfaType ?? 'device'}.`}
            </p>
          </div>

          <input
            ref={mfaRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
            required
            disabled={isLoading}
            className="text-center text-3xl tracking-[0.4em] rounded-xl bg-gray-900 border border-gray-700 focus:border-indigo-500 px-4 py-4 text-white outline-none transition-colors duration-150 font-mono disabled:opacity-50"
            placeholder="_ _ _ _ _ _"
          />

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || mfaCode.length !== 6}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner size={16} /> : null}
            {isLoading ? 'Verifying…' : 'Verify'}
          </button>
        </form>
      )}

      {/* Step 3: SMS / Email challenge */}
      {step === 'challenge' && (
        <form onSubmit={handleChallenge} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Robinhood sent a verification code to your{' '}
              {challengeType === 'sms' ? 'phone' : 'email'}.
            </p>
          </div>

          <input
            ref={challengeRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={challengeCode}
            onChange={(e) => setChallengeCode(e.target.value.replace(/\D/g, ''))}
            required
            disabled={isLoading}
            className="text-center text-3xl tracking-[0.4em] rounded-xl bg-gray-900 border border-gray-700 focus:border-indigo-500 px-4 py-4 text-white outline-none transition-colors duration-150 font-mono disabled:opacity-50"
            placeholder="_ _ _ _ _ _"
          />

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || challengeCode.length < 4}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner size={16} /> : null}
            {isLoading ? 'Verifying…' : 'Verify'}
          </button>
        </form>
      )}
    </div>
  );
}
