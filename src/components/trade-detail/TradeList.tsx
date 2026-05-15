import type { NormalizedTrade } from '@/types/trade';
import { TradeRow } from './TradeRow';

interface TradeListProps {
  trades: NormalizedTrade[];
}

export function TradeList({ trades }: TradeListProps) {
  if (trades.length === 0) {
    return <p className="text-sm text-gray-500 py-4 text-center">No trades for this day.</p>;
  }

  const sorted = [...trades].sort(
    (a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
  );

  return (
    <div className="flex flex-col">
      {sorted.map((trade, i) => (
        <TradeRow key={trade.id} trade={trade} index={i} />
      ))}
    </div>
  );
}
