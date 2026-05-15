'use client';
import { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface Props {
  mode: 'login' | 'signup';
  onSuccess: () => void;
  onSwitchMode: () => void;
}

export function TradeTrackerAuthForm({ mode, onSuccess, onSwitchMode }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { signIn, signUp, isLoading, error } = useSupabaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup') {
      if (password !== confirmPassword) return;
      const ok = await signUp(email, password);
      if (ok) setSignupSuccess(true);
    } else {
      const ok = await signIn(email, password);
      if (ok) onSuccess();
    }
  };

  if (signupSuccess) {
    return (
      <div className="text-center flex flex-col gap-4 animate-in fade-in duration-300">
        <div className="text-4xl">✉️</div>
        <h2 className="text-lg font-bold text-white">Check your email</h2>
        <p className="text-sm text-gray-400">
          We sent a confirmation link to <strong className="text-white">{email}</strong>.
          Click it to activate your account, then log in.
        </p>
        <button
          onClick={onSwitchMode}
          className="text-sm text-indigo-400 hover:text-indigo-300 underline transition-colors"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full animate-in fade-in duration-300">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email</label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="rounded-xl bg-gray-900 border border-gray-700 focus:border-indigo-500 px-4 py-3 text-white text-sm outline-none transition-colors duration-150 placeholder:text-gray-600 disabled:opacity-50"
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Password</label>
        <input
          type="password"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="rounded-xl bg-gray-900 border border-gray-700 focus:border-indigo-500 px-4 py-3 text-white text-sm outline-none transition-colors duration-150 placeholder:text-gray-600 disabled:opacity-50"
          placeholder="••••••••"
        />
      </div>

      {mode === 'signup' && (
        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <label className="text-xs text-gray-400 font-medium uppercase tracking-wider">Confirm Password</label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            className={`rounded-xl bg-gray-900 border px-4 py-3 text-white text-sm outline-none transition-colors duration-150 placeholder:text-gray-600 disabled:opacity-50 ${
              confirmPassword && confirmPassword !== password
                ? 'border-red-600 focus:border-red-500'
                : 'border-gray-700 focus:border-indigo-500'
            }`}
            placeholder="••••••••"
          />
          {confirmPassword && confirmPassword !== password && (
            <p className="text-xs text-red-400">Passwords don&apos;t match</p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 text-center animate-in fade-in duration-200">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading || !email || !password || (mode === 'signup' && password !== confirmPassword)}
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-3 text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed mt-1"
      >
        {isLoading && <LoadingSpinner size={16} />}
        {isLoading
          ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
          : (mode === 'signup' ? 'Create Account' : 'Sign In')}
      </button>

      <p className="text-center text-sm text-gray-500">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-indigo-400 hover:text-indigo-300 underline transition-colors"
        >
          {mode === 'login' ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </form>
  );
}
