'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface SupabaseAuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export function useSupabaseAuth() {
  const [state, setState] = useState<SupabaseAuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setState({ user, isLoading: false, error: null });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setState({ user: session?.user ?? null, isLoading: false, error: null });
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signUp = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setState((s) => ({ ...s, isLoading: false, error: error.message }));
    else setState((s) => ({ ...s, isLoading: false }));
    return !error;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setState((s) => ({ ...s, isLoading: false, error: error.message }));
    else setState((s) => ({ ...s, isLoading: false }));
    return !error;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, isLoading: false, error: null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, signUp, signIn, signOut };
}
