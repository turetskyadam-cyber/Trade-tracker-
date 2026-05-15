'use client';
export const dynamic = 'force-dynamic';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { NoSSR } from '@/components/ui/NoSSR';

function HomeInner() {
  const router = useRouter();
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      router.replace(user ? '/calendar' : '/login');
    });
  }, [router]);
  return null;
}

export default function Home() {
  return <NoSSR><HomeInner /></NoSSR>;
}
