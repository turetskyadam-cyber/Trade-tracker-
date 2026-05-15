'use client';
import { useState, useCallback } from 'react';

interface TokenState {
  token: string | null;
  isLoading: boolean;
  isConnected: boolean;
  needsReconnect: boolean;
  error: string | null;
}

export function useRobinhoodToken() {
  const [state, setState] = useState<TokenState>({
    token: null,
    isLoading: false,
    isConnected: false,
    needsReconnect: false,
    error: null,
  });

  const fetchToken = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await fetch('/api/tokens/get');
      const data = await res.json();

      if (!data.connected) {
        setState({ token: null, isLoading: false, isConnected: false, needsReconnect: false, error: null });
        return null;
      }

      if (data.needs_refresh) {
        const refreshRes = await fetch('/api/tokens/refresh', { method: 'POST' });
        const refreshData = await refreshRes.json();

        if (refreshData.error === 'reconnect_required' || refreshRes.status === 401) {
          setState({ token: null, isLoading: false, isConnected: false, needsReconnect: true, error: null });
          return null;
        }

        if (refreshData.access_token) {
          setState({ token: refreshData.access_token, isLoading: false, isConnected: true, needsReconnect: false, error: null });
          return refreshData.access_token as string;
        }
      }

      setState({ token: data.access_token, isLoading: false, isConnected: true, needsReconnect: false, error: null });
      return data.access_token as string;
    } catch {
      setState((s) => ({ ...s, isLoading: false, error: 'Failed to retrieve token' }));
      return null;
    }
  }, []);

  return { ...state, fetchToken };
}
