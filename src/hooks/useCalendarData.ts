'use client';
import { useMemo } from 'react';
import type { NormalizedTrade } from '@/types/trade';
import type { MonthData } from '@/types/calendar';
import { groupTradesByDay } from '@/lib/pnl/groupByDay';
import { computeStockPnL, computeOptionsPnL, buildMonthData } from '@/lib/pnl/calculator';

export function useCalendarData(
  year: number,
  month: number,
  trades: NormalizedTrade[]
): MonthData {
  return useMemo(() => {
    const stockTrades = trades.filter((t) => t.type === 'stock');
    const optionsTrades = trades.filter((t) => t.type === 'option');

    // FIFO needs all history, not just current month
    const stockPnLByDay = computeStockPnL(stockTrades);
    const optionsPnLByDay = computeOptionsPnL(optionsTrades);

    // Group ALL trades by day for the trade detail panel
    const tradesByDay = groupTradesByDay(trades);

    return buildMonthData(year, month, tradesByDay, stockPnLByDay, optionsPnLByDay);
  }, [year, month, trades]);
}
