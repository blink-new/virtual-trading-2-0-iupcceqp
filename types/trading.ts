export interface Stock {
  symbol: string;
  name: string;
  ltp: number; // Last Traded Price
  change: number;
  changePercent: number;
  volume: number;
  openInterest?: number;
}

export interface OptionContract {
  symbol: string;
  strike: number;
  type: 'CE' | 'PE'; // Call or Put
  expiry: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  instrument: 'FUTURES' | 'CE' | 'PE';
  quantity: number;
  price: number;
  timestamp: number;
  expiry?: string;
  strike?: number;
  currentPrice?: number;
  pnl?: number;
}

export interface Portfolio {
  totalBalance: number;
  availableBalance: number;
  totalPnL: number;
  dayPnL: number;
  positions: Position[];
  trades: Trade[];
}

export interface Position {
  id: string;
  symbol: string;
  instrument: 'FUTURES' | 'CE' | 'PE';
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  expiry?: string;
  strike?: number;
}

export interface ChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Alert {
  id: string;
  type: 'OPPORTUNITY' | 'TARGET' | 'STOP_LOSS';
  title: string;
  message: string;
  timestamp: number;
  symbol?: string;
  isRead: boolean;
}