'use client';
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { ConnectRobinhoodForm } from '@/components/auth/ConnectRobinhoodForm';
import { NoSSR } from '@/components/ui/NoSSR';

export default function ConnectPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 mb-8 animate-in fade-in duration-500">
        <div className="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-900/50">
          🔗
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">Connect Robinhood</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            One-time setup. After this you&apos;ll never need to enter these again.
          </p>
        </div>
      </div>

      <NoSSR>
        <ConnectRobinhoodForm onConnected={() => router.push('/calendar')} />
      </NoSSR>

      <p className="mt-8 text-xs text-gray-700 text-center max-w-xs leading-relaxed">
        Uses Robinhood&apos;s unofficial API. Your credentials go directly to Robinhood
        and are never saved — only an encrypted access token is stored.
      </p>
    </div>
  );
}
