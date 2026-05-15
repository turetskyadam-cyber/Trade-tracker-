import { useCountUp } from '@/hooks/useCountUp';

interface MonthTotalProps {
  monthlyPnL: number;
  tradingDays: number;
}

export function MonthTotal({ monthlyPnL, tradingDays }: MonthTotalProps) {
  const animated = useCountUp(monthlyPnL);
  const sign = animated >= 0 ? '+' : '';
  const formatted = `${sign}$${Math.abs(animated).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <div className="flex items-center justify-between px-2 py-3 border-t border-gray-800 mt-1">
      <span className="text-sm text-gray-400">
        Monthly total
        {tradingDays > 0 && (
          <span className="ml-2 text-gray-600 text-xs">({tradingDays} trading days)</span>
        )}
      </span>
      <span
        className={`text-xl font-bold tabular-nums transition-colors duration-300 ${
          monthlyPnL >= 0 ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {formatted}
      </span>
    </div>
  );
}
