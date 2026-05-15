'use client';
import { useState, useEffect } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { MonthTotal } from './MonthTotal';
import { StatsBar } from '@/components/ui/StatsBar';
import { FetchProgress } from '@/components/ui/FetchProgress';
import { TradePanel } from '@/components/trade-detail/TradePanel';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { CalendarSkeleton } from '@/components/ui/DaySkeleton';
import { useOrders } from '@/hooks/useOrders';
import { useCalendarData } from '@/hooks/useCalendarData';

interface CalendarViewProps {
  token: string;
  onLogout: () => void;
}

export function CalendarView({ token, onLogout }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [dismissedError, setDismissedError] = useState(false);

  const { trades, isLoading, progress, error, lastFetchedAt, fetchOrders } = useOrders();
  const monthData = useCalendarData(year, month, trades);

  // Initial fetch
  useEffect(() => {
    fetchOrders(token);
  }, [token, fetchOrders]);

  const handlePrevMonth = () => {
    setSelectedDateKey(null);
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    setSelectedDateKey(null);
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  const handleRefresh = () => {
    setDismissedError(false);
    fetchOrders(token, true);
  };

  const selectedDay = selectedDateKey
    ? monthData.weeks.flatMap(w => w.days).find(d => d.dateKey === selectedDateKey)
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <FetchProgress isLoading={isLoading} stage={progress.stage} />

      <div className="max-w-4xl mx-auto px-3 py-4">
        {/* App title */}
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold">
            T
          </div>
          <span className="font-bold text-white tracking-tight">TradeTracker</span>
        </div>

        {/* Error */}
        {error && !dismissedError && (
          <div className="mb-3">
            <ErrorBanner
              message={error}
              onDismiss={() => setDismissedError(true)}
            />
          </div>
        )}

        {/* Stats bar */}
        {trades.length > 0 && (
          <StatsBar
            winRate={monthData.winRate}
            monthlyPnL={monthData.monthlyPnL}
            bestDay={monthData.bestDay}
            worstDay={monthData.worstDay}
            totalTrades={monthData.totalTrades}
            tradingDays={monthData.tradingDays}
          />
        )}

        {/* Calendar */}
        <div className="rounded-2xl bg-gray-900/50 border border-gray-800 overflow-hidden mt-3">
          <CalendarHeader
            year={year}
            month={month}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onRefresh={handleRefresh}
            onLogout={onLogout}
            isLoading={isLoading}
            lastFetchedAt={lastFetchedAt}
          />

          <div className="px-3 pb-2">
            {isLoading && trades.length === 0 ? (
              <CalendarSkeleton />
            ) : (
              <CalendarGrid
                monthData={monthData}
                selectedDateKey={selectedDateKey}
                onDayClick={(key) =>
                  setSelectedDateKey(prev => prev === key ? null : key)
                }
              />
            )}
          </div>

          <MonthTotal
            monthlyPnL={monthData.monthlyPnL}
            tradingDays={monthData.tradingDays}
          />
        </div>
      </div>

      {/* Trade detail panel */}
      <TradePanel
        dateKey={selectedDateKey}
        trades={selectedDay?.trades ?? []}
        dayPnL={selectedDay?.pnl ?? 0}
        onClose={() => setSelectedDateKey(null)}
      />
    </div>
  );
}
