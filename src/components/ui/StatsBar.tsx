'use client';
import type { DayData } from '@/types/calendar';
import { useCountUp } from '@/hooks/useCountUp';

function formatPnL(v: number) {
  const sign = v >= 0 ? '+' : '';
  return `${sign}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}

function StatCard({ label, value, sub, positive }: StatCardProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-gray-900/60 border border-gray-800 px-4 py-3 min-w-[100px]">
      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">{label}</span>
      <span
        className={`text-lg font-bold tabular-nums transition-colors duration-300 ${
          positive === undefined
            ? 'text-white'
            : positive
            ? 'text-green-400'
            : 'text-red-400'
        }`}
      >
        {value}
      </span>
      {sub && <span className="text-[11px] text-gray-500">{sub}</span>}
    </div>
  );
}

interface StatsBarProps {
  winRate: number;
  monthlyPnL: number;
  bestDay: DayData | null;
  worstDay: DayData | null;
  totalTrades: number;
  tradingDays: number;
}

export function StatsBar({
  winRate,
  monthlyPnL,
  bestDay,
  worstDay,
  totalTrades,
  tradingDays,
}: StatsBarProps) {
  const animatedRate = useCountUp(winRate);
  const animatedPnL = useCountUp(monthlyPnL);
  const animatedTrades = useCountUp(totalTrades);

  return (
    <div className="flex flex-wrap gap-2 px-1 py-2">
      <StatCard
        label="Win Rate"
        value={`${animatedRate.toFixed(0)}%`}
        sub={`${tradingDays} trading days`}
        positive={winRate >= 50}
      />
      <StatCard
        label="Net P&L"
        value={formatPnL(animatedPnL)}
        positive={monthlyPnL >= 0}
      />
      <StatCard
        label="Best Day"
        value={bestDay ? formatPnL(bestDay.pnl) : '—'}
        sub={bestDay?.dateKey}
        positive={bestDay ? true : undefined}
      />
      <StatCard
        label="Worst Day"
        value={worstDay ? formatPnL(worstDay.pnl) : '—'}
        sub={worstDay?.dateKey}
        positive={worstDay ? false : undefined}
      />
      <StatCard
        label="Total Trades"
        value={Math.round(animatedTrades).toString()}
      />
    </div>
  );
}
