import type { NormalizedTrade } from '@/types/trade';
import type { DayData, DayStatus, MonthData, WeekData } from '@/types/calendar';

interface Lot {
  quantity: number;
  price: number;
  dateKey: string;
}

/**
 * FIFO P&L for stock trades.
 * Returns a map of dateKey → realized P&L for that day.
 * Must receive ALL historical trades (not just current month) for correct FIFO matching.
 */
export function computeStockPnL(
  stockTrades: NormalizedTrade[]
): Map<string, number> {
  // Sort all trades chronologically
  const sorted = [...stockTrades].sort(
    (a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
  );

  const lots = new Map<string, Lot[]>(); // symbol → FIFO queue
  const dailyPnL = new Map<string, number>();

  for (const trade of sorted) {
    if (!lots.has(trade.symbol)) lots.set(trade.symbol, []);
    const queue = lots.get(trade.symbol)!;

    if (trade.side === 'buy') {
      queue.push({ quantity: trade.quantity, price: trade.price, dateKey: trade.dateKey });
    } else {
      // SELL — pop FIFO lots
      let remaining = trade.quantity;
      while (remaining > 0 && queue.length > 0) {
        const lot = queue[0];
        const matched = Math.min(remaining, lot.quantity);
        const pnl = (trade.price - lot.price) * matched;

        const prev = dailyPnL.get(trade.dateKey) ?? 0;
        dailyPnL.set(trade.dateKey, prev + pnl);

        lot.quantity -= matched;
        remaining -= matched;
        if (lot.quantity <= 0) queue.shift();
      }
    }
  }

  return dailyPnL;
}

/**
 * Premium-based P&L for options trades.
 * Each NormalizedTrade already carries the correct totalValue sign.
 */
export function computeOptionsPnL(
  optionsTrades: NormalizedTrade[]
): Map<string, number> {
  const dailyPnL = new Map<string, number>();
  for (const trade of optionsTrades) {
    const prev = dailyPnL.get(trade.dateKey) ?? 0;
    dailyPnL.set(trade.dateKey, prev + trade.totalValue);
  }
  return dailyPnL;
}

function dayStatus(pnl: number, hasTrades: boolean): DayStatus {
  if (!hasTrades) return 'no-trades';
  if (pnl > 0.005) return 'profit';
  if (pnl < -0.005) return 'loss';
  return 'breakeven';
}

export function buildMonthData(
  year: number,
  month: number, // 0-indexed
  tradesByDay: Map<string, NormalizedTrade[]>,
  stockPnLByDay: Map<string, number>,
  optionsPnLByDay: Map<string, number>
): MonthData {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = today.toLocaleDateString('en-CA');

  // First day of month, find the Sunday of that week
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0 = Sunday

  // Total days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build all DayData for every calendar cell (including padding from adjacent months)
  const allDays: DayData[] = [];

  // Pad leading days from previous month
  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, 1 - (startOffset - i));
    const dateKey = d.toLocaleDateString('en-CA');
    allDays.push({
      dateKey,
      date: d,
      status: 'no-trades',
      pnl: 0,
      trades: [],
      isCurrentMonth: false,
      isToday: false,
    });
  }

  let winDays = 0;
  let lossDays = 0;
  let totalTrades = 0;
  let bestDay: DayData | null = null;
  let worstDay: DayData | null = null;

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateKey = d.toLocaleDateString('en-CA');
    const trades = tradesByDay.get(dateKey) ?? [];
    const stockPnL = stockPnLByDay.get(dateKey) ?? 0;
    const optPnL = optionsPnLByDay.get(dateKey) ?? 0;
    const pnl = stockPnL + optPnL;
    const hasTrades = trades.length > 0;
    const status = dayStatus(pnl, hasTrades);

    const dayData: DayData = {
      dateKey,
      date: d,
      status,
      pnl,
      trades,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
    };

    if (status === 'profit') {
      winDays++;
      if (!bestDay || pnl > bestDay.pnl) bestDay = dayData;
    } else if (status === 'loss') {
      lossDays++;
      if (!worstDay || pnl < worstDay.pnl) worstDay = dayData;
    }

    totalTrades += trades.length;
    allDays.push(dayData);
  }

  // Pad trailing days to complete last week
  const trailingDays = (7 - (allDays.length % 7)) % 7;
  for (let i = 1; i <= trailingDays; i++) {
    const d = new Date(year, month + 1, i);
    const dateKey = d.toLocaleDateString('en-CA');
    allDays.push({
      dateKey,
      date: d,
      status: 'no-trades',
      pnl: 0,
      trades: [],
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Slice into weeks
  const weeks: WeekData[] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    const days = allDays.slice(i, i + 7);
    const weeklyPnL = days
      .filter((d) => d.isCurrentMonth)
      .reduce((sum, d) => sum + d.pnl, 0);
    weeks.push({ weekIndex: i / 7, days, weeklyPnL });
  }

  const tradingDays = winDays + lossDays;
  const monthlyPnL = weeks.reduce((sum, w) => sum + w.weeklyPnL, 0);
  const winRate = tradingDays > 0 ? (winDays / tradingDays) * 100 : 0;

  return {
    year,
    month,
    weeks,
    monthlyPnL,
    tradingDays,
    winDays,
    lossDays,
    winRate,
    bestDay,
    worstDay,
    totalTrades,
  };
}
