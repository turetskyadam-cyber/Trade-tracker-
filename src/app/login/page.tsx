'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { getStoredAuth } from '@/lib/robinhood/auth';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (getStoredAuth()) router.replace('/calendar');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-10 animate-in fade-in duration-500">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-900/50">
          T
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">TradeTracker</h1>
          <p className="text-sm text-gray-500 mt-1">Your Robinhood P&L journal</p>
        </div>
      </div>

      <LoginForm onAuthenticated={() => router.push('/calendar')} />

      <p className="mt-8 text-xs text-gray-700 text-center max-w-xs leading-relaxed">
        This app uses Robinhood&apos;s unofficial API. Use at your own discretion.
        Your data stays in your browser.
      </p>
    </div>
  );
}
