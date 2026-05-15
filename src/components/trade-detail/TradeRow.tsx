import type { NormalizedTrade } from '@/types/trade';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatValue(v: number) {
  const sign = v >= 0 ? '+' : '';
  return `${sign}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface TradeRowProps {
  trade: NormalizedTrade;
  index: number;
}

export function TradeRow({ trade, index }: TradeRowProps) {
  const isPositive = trade.totalValue > 0;

  return (
    <div
      className="flex items-start gap-3 py-2.5 border-b border-gray-800/60 last:border-0 animate-in fade-in slide-in-from-bottom-2 duration-200 fill-mode-both"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Symbol + type badge */}
      <div className="flex flex-col gap-1 min-w-[60px]">
        <span className="font-bold text-sm text-white">{trade.symbol}</span>
        <span
          className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded w-fit ${
            trade.type === 'option'
              ? 'bg-purple-900/60 text-purple-300'
              : 'bg-blue-900/60 text-blue-300'
          }`}
        >
          {trade.type}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span
            className={`uppercase font-semibold ${
              trade.side === 'buy' ? 'text-blue-400' : 'text-amber-400'
            }`}
          >
            {trade.side === 'buy' ? (trade.direction === 'debit' ? 'Debit' : 'Buy') : (trade.direction === 'credit' ? 'Credit' : 'Sell')}
          </span>
          <span>·</span>
          <span>{trade.quantity % 1 === 0 ? trade.quantity : trade.quantity.toFixed(4)} {trade.type === 'stock' ? 'sh' : 'contracts'}</span>
          {trade.price > 0 && (
            <>
              <span>·</span>
              <span>${trade.price.toFixed(2)}</span>
            </>
          )}
        </div>
        {trade.strategy && (
          <span className="text-[10px] text-gray-500 capitalize">{trade.strategy.replace(/_/g, ' ')}</span>
        )}
        <span className="text-[10px] text-gray-600">{formatTime(trade.executedAt)}</span>
      </div>

      {/* Value */}
      <span
        className={`text-sm font-bold tabular-nums ${isPositive ? 'text-green-400' : 'text-red-400'}`}
      >
        {formatValue(trade.totalValue)}
      </span>
    </div>
  );
}
