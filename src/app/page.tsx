'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredAuth } from '@/lib/robinhood/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getStoredAuth() ? '/calendar' : '/login');
  }, [router]);

  return null;
}
