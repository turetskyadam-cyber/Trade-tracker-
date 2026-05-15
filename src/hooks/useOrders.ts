'use client';
import { useState, useCallback, useRef } from 'react';
import type { NormalizedTrade } from '@/types/trade';
import { fetchAllStockOrders, normalizeStockOrder } from '@/lib/robinhood/orders';
import { fetchAllOptionsOrders, normalizeOptionsOrder } from '@/lib/robinhood/options';
import { resolveInstruments } from '@/lib/robinhood/instruments';
import { cacheGet, cacheSet, TTL } from '@/lib/storage/cache';

interface OrdersState {
  trades: NormalizedTrade[];
  isLoading: boolean;
  progress: { loaded: number; stage: string };
  error: string | null;
  lastFetchedAt: number | null;
}

const CACHE_KEY = 'rh_normalized_trades';

export function useOrders() {
  const [state, setState] = useState<OrdersState>(() => {
    const cached = cacheGet<{ trades: NormalizedTrade[]; fetchedAt: number }>(CACHE_KEY);
    if (cached) {
      return {
        trades: cached.trades,
        isLoading: false,
        progress: { loaded: 0, stage: '' },
        error: null,
        lastFetchedAt: cached.fetchedAt,
      };
    }
    return {
      trades: [],
      isLoading: false,
      progress: { loaded: 0, stage: '' },
      error: null,
      lastFetchedAt: null,
    };
  });

  const fetchingRef = useRef(false);

  const fetchOrders = useCallback(async (token: string, force = false) => {
    if (fetchingRef.current) return;

    // Use cache unless forced
    if (!force) {
      const cached = cacheGet<{ trades: NormalizedTrade[]; fetchedAt: number }>(CACHE_KEY);
      if (cached) {
        setState((s) => ({ ...s, trades: cached.trades, lastFetchedAt: cached.fetchedAt }));
        return;
      }
    }

    fetchingRef.current = true;
    setState((s) => ({ ...s, isLoading: true, error: null, progress: { loaded: 0, stage: 'Fetching stock orders…' } }));

    try {
      // Fetch stock orders
      const rawStockOrders = await fetchAllStockOrders(token, ({ loaded }) => {
        setState((s) => ({ ...s, progress: { loaded, stage: `Loading stock orders… (${loaded})` } }));
      });

      setState((s) => ({ ...s, progress: { loaded: rawStockOrders.length, stage: 'Resolving symbols…' } }));

      // Resolve instrument symbols
      const instrumentUrls = rawStockOrders.map((o) => o.instrument);
      const instrumentMap = await resolveInstruments(instrumentUrls, token);

      setState((s) => ({ ...s, progress: { loaded: 0, stage: 'Fetching options orders…' } }));

      // Fetch options orders
      const rawOptionsOrders = await fetchAllOptionsOrders(token, (loaded) => {
        setState((s) => ({ ...s, progress: { loaded, stage: `Loading options orders… (${loaded})` } }));
      });

      setState((s) => ({ ...s, progress: { loaded: rawOptionsOrders.length, stage: 'Processing trades…' } }));

      // Normalize all trades
      const stockTrades = rawStockOrders.flatMap((o) => normalizeStockOrder(o, instrumentMap));
      const optionsTrades = rawOptionsOrders
        .map(normalizeOptionsOrder)
        .filter((t): t is NormalizedTrade => t !== null);

      const allTrades = [...stockTrades, ...optionsTrades];
      const fetchedAt = Date.now();

      cacheSet(CACHE_KEY, { trades: allTrades, fetchedAt }, TTL.FIFTEEN_MIN);

      setState({
        trades: allTrades,
        isLoading: false,
        progress: { loaded: allTrades.length, stage: '' },
        error: null,
        lastFetchedAt: fetchedAt,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load trades';
      setState((s) => ({ ...s, isLoading: false, error: msg }));
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  return { ...state, fetchOrders };
}
