'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TradeTrackerAuthForm } from '@/components/auth/TradeTrackerAuthForm';
import { NoSSR } from '@/components/ui/NoSSR';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 mb-10 animate-in fade-in duration-500">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-900/50">
          T
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">TradeTracker</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>
      </div>

      <NoSSR>
        <TradeTrackerAuthForm
          mode={mode}
          onSuccess={() => router.push('/calendar')}
          onSwitchMode={() => setMode(mode === 'login' ? 'signup' : 'login')}
        />
      </NoSSR>
    </div>
  );
}
