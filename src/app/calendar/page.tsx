'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarView } from '@/components/calendar/CalendarView';
import { createClient } from '@/lib/supabase/client';
import { useRobinhoodToken } from '@/hooks/useRobinhoodToken';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { NoSSR } from '@/components/ui/NoSSR';

function CalendarPageInner() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const { token, needsReconnect, fetchToken } = useRobinhoodToken();

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/login'); return; }
      const t = await fetchToken();
      if (!t) { router.replace('/connect'); return; }
      setReady(true);
    });
  }, [router, fetchToken]);

  useEffect(() => {
    if (needsReconnect) router.replace('/connect');
  }, [needsReconnect, router]);

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.replace('/login');
  };

  if (!ready || !token) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return <CalendarView token={token} onLogout={handleLogout} />;
}

export default function CalendarPage() {
  return <NoSSR><CalendarPageInner /></NoSSR>;
}
