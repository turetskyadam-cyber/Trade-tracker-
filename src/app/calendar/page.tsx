'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarView } from '@/components/calendar/CalendarView';
import { getStoredAuth, clearAuth } from '@/lib/robinhood/auth';

export default function CalendarPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth) {
      router.replace('/login');
    } else {
      setToken(auth.access_token);
    }
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  if (!token) return null;

  return <CalendarView token={token} onLogout={handleLogout} />;
}
