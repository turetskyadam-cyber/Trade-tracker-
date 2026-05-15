import type { RHOrder } from '@/types/robinhood';
import type { NormalizedTrade } from '@/types/trade';
import { extractInstrumentId } from './instruments';

export type FetchProgress = { loaded: number; total: number | null };

export async function fetchAllStockOrders(
  token: string,
  onProgress?: (p: FetchProgress) => void
): Promise<RHOrder[]> {
  const all: RHOrder[] = [];
  let cursor: string | null = null;
  let page = 0;

  while (true) {
    const url = cursor
      ? `/api/robinhood/orders?cursor=${encodeURIComponent(cursor)}`
      : '/api/robinhood/orders';

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      if (res.status === 401) throw new Error('TOKEN_EXPIRED');
      throw new Error(`Orders fetch failed: ${res.status}`);
    }

    const data: { results: RHOrder[]; next_cursor: string | null } = await res.json();
    all.push(...data.results);
    page++;

    onProgress?.({ loaded: all.length, total: null });

    cursor = data.next_cursor;
    if (!cursor) break;
  }

  return all;
}

export function normalizeStockOrder(
  order: RHOrder,
  instrumentMap: Record<string, { symbol: string; name: string }>
): NormalizedTrade[] {
  if (order.state !== 'filled' && order.state !== 'partially_filled') return [];

  const instrumentId = extractInstrumentId(order.instrument);
  const symbol = instrumentMap[instrumentId]?.symbol ?? instrumentId;

  return order.executions.map((exec) => {
    const qty = parseFloat(exec.quantity);
    const price = parseFloat(exec.price);
    const totalValue = order.side === 'sell' ? qty * price : -(qty * price);
    const dateKey = new Date(exec.timestamp).toLocaleDateString('en-CA');

    return {
      id: exec.id,
      symbol,
      type: 'stock' as const,
      side: order.side,
      quantity: qty,
      price,
      totalValue,
      executedAt: exec.timestamp,
      dateKey,
      rawOrderId: order.id,
    };
  });
}
