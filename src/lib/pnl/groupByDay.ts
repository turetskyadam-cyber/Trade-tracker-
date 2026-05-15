import type { NormalizedTrade } from '@/types/trade';

export function groupTradesByDay(trades: NormalizedTrade[]): Map<string, NormalizedTrade[]> {
  const map = new Map<string, NormalizedTrade[]>();
  for (const trade of trades) {
    const group = map.get(trade.dateKey) ?? [];
    group.push(trade);
    map.set(trade.dateKey, group);
  }
  return map;
}
