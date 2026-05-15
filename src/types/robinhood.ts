export interface RHAuthRequest {
  username: string;
  password: string;
  grant_type: 'password';
  client_id: string;
  device_token: string;
  scope: 'internal';
  challenge_type?: 'sms' | 'email';
  mfa_code?: string;
}

export interface RHAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string;
  mfa_required?: boolean;
  mfa_type?: 'app' | 'sms' | 'email';
  challenge?: { id: string; type: string; status: string };
}

export interface RHExecution {
  price: string;
  quantity: string;
  settlement_date: string;
  timestamp: string;
  id: string;
}

export interface RHOrder {
  id: string;
  instrument: string;
  side: 'buy' | 'sell';
  state: 'filled' | 'cancelled' | 'failed' | 'pending' | 'confirmed' | 'partially_filled';
  type: 'market' | 'limit' | 'stop_loss' | 'stop_limit';
  quantity: string;
  average_price: string | null;
  executed_notional: { amount: string; currency_code: string } | null;
  last_transaction_at: string;
  created_at: string;
  updated_at: string;
  executions: RHExecution[];
}

export interface RHOrdersPage {
  results: RHOrder[];
  next: string | null;
  previous: string | null;
}

export interface RHOptionsExecution {
  price: string;
  quantity: string;
  settlement_date: string;
  timestamp: string;
  id: string;
}

export interface RHOptionsLeg {
  id: string;
  option: string;
  side: 'buy' | 'sell';
  position_effect: 'open' | 'close';
  ratio_quantity: number;
  executions: RHOptionsExecution[];
}

export interface RHOptionsOrder {
  id: string;
  chain_symbol: string;
  direction: 'debit' | 'credit';
  opening_strategy: string | null;
  closing_strategy: string | null;
  state: 'filled' | 'cancelled' | 'failed' | 'pending' | 'confirmed';
  premium: string;
  processed_premium: string | null;
  created_at: string;
  updated_at: string;
  legs: RHOptionsLeg[];
}

export interface RHOptionsOrdersPage {
  results: RHOptionsOrder[];
  next: string | null;
  previous: string | null;
}

export interface RHInstrument {
  id: string;
  symbol: string;
  simple_name: string | null;
  name: string;
  tradeable: boolean;
}
