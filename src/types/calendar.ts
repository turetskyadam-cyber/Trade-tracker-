import type { NormalizedTrade } from './trade';

export type DayStatus = 'profit' | 'loss' | 'breakeven' | 'no-trades';

export interface DayData {
  dateKey: string;
  date: Date;
  status: DayStatus;
  pnl: number;
  trades: NormalizedTrade[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface WeekData {
  weekIndex: number;
  days: DayData[];
  weeklyPnL: number;
}

export interface MonthData {
  year: number;
  month: number;
  weeks: WeekData[];
  monthlyPnL: number;
  tradingDays: number;
  winDays: number;
  lossDays: number;
  winRate: number;
  bestDay: DayData | null;
  worstDay: DayData | null;
  totalTrades: number;
}

export interface CalendarState {
  currentYear: number;
  currentMonth: number;
  selectedDateKey: string | null;
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}
