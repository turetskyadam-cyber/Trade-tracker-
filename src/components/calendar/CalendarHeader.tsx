'use client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  isLoading: boolean;
  lastFetchedAt: number | null;
}

export function CalendarHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onRefresh,
  onLogout,
  isLoading,
  lastFetchedAt,
}: CalendarHeaderProps) {
  const lastSync = lastFetchedAt
    ? new Date(lastFetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onPrevMonth}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-150 disabled:opacity-30"
          aria-label="Previous month"
        >
          ◀
        </button>

        <h2 className="text-lg font-bold text-white min-w-[180px] text-center tabular-nums transition-all duration-250">
          {MONTHS[month]} {year}
        </h2>

        <button
          onClick={onNextMonth}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-150 disabled:opacity-30"
          aria-label="Next month"
        >
          ▶
        </button>
      </div>

      <div className="flex items-center gap-2">
        {lastSync && (
          <span className="text-xs text-gray-600 hidden sm:block">synced {lastSync}</span>
        )}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all duration-150 disabled:opacity-40"
        >
          {isLoading ? <LoadingSpinner size={14} /> : <span>↻</span>}
          <span className="hidden sm:inline">Refresh</span>
        </button>
        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-950/30 transition-all duration-150"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
