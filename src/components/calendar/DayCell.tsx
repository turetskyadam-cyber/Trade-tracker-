'use client';
import type { DayData, DayStatus } from '@/types/calendar';

function getPnLIntensityClass(pnl: number, status: DayStatus): string {
  if (status === 'no-trades') return 'bg-gray-900 hover:bg-gray-800 cursor-default';
  if (status === 'breakeven') return 'bg-gray-700 hover:bg-gray-600 cursor-pointer';

  if (status === 'profit') {
    if (pnl > 500) return 'bg-green-400 hover:bg-green-300 cursor-pointer';
    if (pnl > 100) return 'bg-green-600 hover:bg-green-500 cursor-pointer';
    return 'bg-green-800 hover:bg-green-700 cursor-pointer';
  }

  // loss
  if (pnl < -500) return 'bg-red-400 hover:bg-red-300 cursor-pointer';
  if (pnl < -100) return 'bg-red-600 hover:bg-red-500 cursor-pointer';
  return 'bg-red-800 hover:bg-red-700 cursor-pointer';
}

function formatPnL(pnl: number): string {
  if (pnl === 0) return '';
  const sign = pnl > 0 ? '+' : '';
  if (Math.abs(pnl) >= 1000) {
    return `${sign}$${(pnl / 1000).toFixed(1)}k`;
  }
  return `${sign}$${Math.abs(pnl).toFixed(0)}`;
}

interface DayCellProps {
  day: DayData;
  isSelected: boolean;
  rowIndex: number;
  onClick: (dateKey: string) => void;
}

export function DayCell({ day, isSelected, rowIndex, onClick }: DayCellProps) {
  const isClickable = day.status !== 'no-trades';
  const colorClass = getPnLIntensityClass(day.pnl, day.status);
  const pnlText = formatPnL(day.pnl);
  const isOtherMonth = !day.isCurrentMonth;

  return (
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={() => isClickable && onClick(day.dateKey)}
      onKeyDown={(e) => e.key === 'Enter' && isClickable && onClick(day.dateKey)}
      style={{ animationDelay: `${rowIndex * 50}ms` }}
      className={[
        'relative min-h-[70px] rounded-lg transition-all duration-150 select-none',
        'flex flex-col justify-between p-1.5',
        'animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both',
        colorClass,
        isOtherMonth ? 'opacity-20 pointer-events-none' : '',
        isSelected
          ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-950 scale-[1.06]'
          : isClickable
          ? 'hover:scale-[1.04]'
          : '',
        day.isToday ? 'ring-1 ring-indigo-400' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={`text-xs font-semibold leading-none ${
          day.isToday ? 'text-indigo-200' : 'text-white/80'
        }`}
      >
        {day.date.getDate()}
      </span>

      {pnlText && (
        <span
          className={`text-[10px] font-bold text-right leading-none transition-opacity delay-200 ${
            day.status === 'profit' ? 'text-white' : 'text-white'
          }`}
        >
          {pnlText}
        </span>
      )}
    </div>
  );
}
