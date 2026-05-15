import type { RHOptionsOrder } from '@/types/robinhood';
import type { NormalizedTrade } from '@/types/trade';

export async function fetchAllOptionsOrders(
  token: string,
  onProgress?: (loaded: number) => void
): Promise<RHOptionsOrder[]> {
  const all: RHOptionsOrder[] = [];
  let cursor: string | null = null;

  while (true) {
    const url = cursor
      ? `/api/robinhood/options?cursor=${encodeURIComponent(cursor)}`
      : '/api/robinhood/options';

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      if (res.status === 401) throw new Error('TOKEN_EXPIRED');
      throw new Error(`Options fetch failed: ${res.status}`);
    }

    const data: { results: RHOptionsOrder[]; next_cursor: string | null } = await res.json();
    all.push(...data.results);

    onProgress?.(all.length);

    cursor = data.next_cursor;
    if (!cursor) break;
  }

  return all;
}

export function normalizeOptionsOrder(order: RHOptionsOrder): NormalizedTrade | null {
  if (order.state !== 'filled') return null;

  const premiumStr = order.processed_premium ?? order.premium;
  const premium = parseFloat(premiumStr);
  if (isNaN(premium)) return null;

  // Credit = money received (positive), debit = money paid (negative)
  const totalValue = order.direction === 'credit' ? premium : -premium;

  // Use the timestamp from the first close-leg execution, or any execution
  let executedAt = order.updated_at;
  for (const leg of order.legs) {
    if (leg.position_effect === 'close' && leg.executions.length > 0) {
      executedAt = leg.executions[0].timestamp;
      break;
    }
  }
  if (!executedAt && order.legs[0]?.executions[0]) {
    executedAt = order.legs[0].executions[0].timestamp;
  }

  const dateKey = new Date(executedAt).toLocaleDateString('en-CA');
  const qty = order.legs.reduce((sum, l) => sum + parseFloat(String(l.ratio_quantity)), 0);

  return {
    id: order.id,
    symbol: order.chain_symbol,
    type: 'option',
    side: order.direction === 'credit' ? 'sell' : 'buy',
    direction: order.direction,
    quantity: qty,
    price: Math.abs(premium / Math.max(qty, 1)),
    totalValue,
    executedAt,
    dateKey,
    rawOrderId: order.id,
    strategy: order.closing_strategy ?? order.opening_strategy ?? undefined,
  };
}
