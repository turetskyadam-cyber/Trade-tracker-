export type TradeType = 'stock' | 'option';
export type TradeSide = 'buy' | 'sell';
export type OptionDirection = 'debit' | 'credit';

export interface NormalizedTrade {
  id: string;
  symbol: string;
  type: TradeType;
  side: TradeSide;
  direction?: OptionDirection;
  quantity: number;
  price: number;
  totalValue: number;
  executedAt: string;
  dateKey: string;
  rawOrderId: string;
  strategy?: string;
}

export interface DayPnL {
  dateKey: string;
  realizedPnL: number;
  trades: NormalizedTrade[];
  tradeCount: number;
}
