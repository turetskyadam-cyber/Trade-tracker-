'use client';
import { useState, useEffect, useCallback } from 'react';
import { getStoredAuth, storeAuth, clearAuth, getOrCreateDeviceToken } from '@/lib/robinhood/auth';

type AuthStep = 'idle' | 'loading' | 'mfa' | 'challenge' | 'authenticated' | 'error';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  step: AuthStep;
  mfaType?: string;
  challengeId?: string;
  challengeType?: string;
  error: string | null;
}

export function useRobinhoodAuth() {
  const [state, setState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
    step: 'idle',
    error: null,
  });

  useEffect(() => {
    const auth = getStoredAuth();
    if (auth) {
      setState({ token: auth.access_token, isAuthenticated: true, step: 'authenticated', error: null });
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setState((s) => ({ ...s, step: 'loading', error: null }));
    const device_token = getOrCreateDeviceToken();

    try {
      const res = await fetch('/api/robinhood/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, device_token }),
      });
      const data = await res.json();

      if (data.mfa_required) {
        setState((s) => ({ ...s, step: 'mfa', mfaType: data.mfa_type, _creds: { username, password, device_token } } as AuthState & { _creds: unknown }));
        return;
      }

      if (data.challenge_required) {
        setState((s) => ({ ...s, step: 'challenge', challengeId: data.challenge_id, challengeType: data.challenge_type, _creds: { username, password, device_token } } as AuthState & { _creds: unknown }));
        return;
      }

      if (data.error || !data.access_token) {
        setState((s) => ({ ...s, step: 'error', error: data.error ?? 'Login failed' }));
        return;
      }

      storeAuth(data.access_token, data.expires_in);
      setState({ token: data.access_token, isAuthenticated: true, step: 'authenticated', error: null });
    } catch {
      setState((s) => ({ ...s, step: 'error', error: 'Network error. Please try again.' }));
    }
  }, []);

  const submitMfa = useCallback(async (
    username: string,
    password: string,
    mfa_code: string
  ) => {
    setState((s) => ({ ...s, step: 'loading', error: null }));
    const device_token = getOrCreateDeviceToken();

    try {
      const res = await fetch('/api/robinhood/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, device_token, mfa_code }),
      });
      const data = await res.json();

      if (data.error || !data.access_token) {
        setState((s) => ({ ...s, step: 'mfa', error: data.error ?? 'Invalid code' }));
        return;
      }

      storeAuth(data.access_token, data.expires_in);
      setState({ token: data.access_token, isAuthenticated: true, step: 'authenticated', error: null });
    } catch {
      setState((s) => ({ ...s, step: 'mfa', error: 'Network error. Please try again.' }));
    }
  }, []);

  const respondToChallenge = useCallback(async (
    username: string,
    password: string,
    challenge_id: string,
    code: string
  ) => {
    setState((s) => ({ ...s, step: 'loading', error: null }));
    const device_token = getOrCreateDeviceToken();

    try {
      // Step 1: respond to challenge
      const respondRes = await fetch('/api/robinhood/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge_id, code }),
      });
      const respondData = await respondRes.json();
      if (respondData.error) {
        setState((s) => ({ ...s, step: 'challenge', error: respondData.error }));
        return;
      }

      // Step 2: re-auth with challenge ID in header
      const authRes = await fetch('/api/robinhood/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, device_token, challenge_response_id: challenge_id }),
      });
      const authData = await authRes.json();

      if (authData.error || !authData.access_token) {
        setState((s) => ({ ...s, step: 'challenge', error: authData.error ?? 'Verification failed' }));
        return;
      }

      storeAuth(authData.access_token, authData.expires_in);
      setState({ token: authData.access_token, isAuthenticated: true, step: 'authenticated', error: null });
    } catch {
      setState((s) => ({ ...s, step: 'challenge', error: 'Network error. Please try again.' }));
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setState({ token: null, isAuthenticated: false, step: 'idle', error: null });
  }, []);

  return { ...state, login, submitMfa, respondToChallenge, logout };
}
