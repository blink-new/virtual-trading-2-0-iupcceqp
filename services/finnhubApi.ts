// Finnhub API Integration for Real-time Stock Data
const FINNHUB_API_KEY = 'd12gph1r01qmhi3iib40d12gph1r01qmhi3iib4g';
const BASE_URL = 'https://finnhub.io/api/v1';

export interface StockQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

// NSE/BSE F&O Stocks - Indian Market Symbols
export const INDIAN_FO_STOCKS = [
  'RELIANCE.NS',
  'TCS.NS',
  'HDFCBANK.NS',
  'INFY.NS',
  'ICICIBANK.NS',
  'HINDUNILVR.NS',
  'SBIN.NS',
  'BHARTIARTL.NS',
  'ITC.NS',
  'ASIANPAINT.NS',
  'LT.NS',
  'AXISBANK.NS',
  'MARUTI.NS',
  'SUNPHARMA.NS',
  'WIPRO.NS',
  'ULTRACEMCO.NS',
  'TITAN.NS',
  'HCLTECH.NS',
  'KOTAKBANK.NS',
  'NESTLEIND.NS'
];

// Indian Indices
export const INDIAN_INDICES = [
  { symbol: '^NSEI', name: 'NIFTY 50' },
  { symbol: '^NSEBANK', name: 'BANK NIFTY' },
  { symbol: '^CNXIT', name: 'NIFTY IT' },
  { symbol: '^CNXPHARMA', name: 'NIFTY PHARMA' }
];

class FinnhubService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Get real-time quote for a symbol
  async getQuote(symbol: string): Promise<StockQuote> {
    try {
      const response = await fetch(
        `${BASE_URL}/quote?symbol=${symbol}&token=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching quote:', error);
      // Return mock data if API fails
      return this.getMockQuote(symbol);
    }
  }

  // Get company profile
  async getCompanyProfile(symbol: string): Promise<CompanyProfile> {
    try {
      const response = await fetch(
        `${BASE_URL}/stock/profile2?symbol=${symbol}&token=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching company profile:', error);
      return this.getMockProfile(symbol);
    }
  }

  // Get candle data for charts
  async getCandles(symbol: string, resolution: string = '5', from: number, to: number) {
    try {
      const response = await fetch(
        `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching candles:', error);
      return this.getMockCandles();
    }
  }

  // Mock data for demo/fallback
  private getMockQuote(symbol: string): StockQuote {
    const basePrice = this.getBasePriceForSymbol(symbol);
    const change = (Math.random() - 0.5) * basePrice * 0.05; // Random change ±5%
    
    return {
      c: basePrice + change,
      d: change,
      dp: (change / basePrice) * 100,
      h: basePrice + Math.abs(change) * 1.2,
      l: basePrice - Math.abs(change) * 1.2,
      o: basePrice,
      pc: basePrice,
      t: Date.now() / 1000
    };
  }

  private getMockProfile(symbol: string): CompanyProfile {
    return {
      country: 'IN',
      currency: 'INR',
      exchange: 'NSE',
      ipo: '1995-11-03',
      marketCapitalization: 1500000,
      name: this.getCompanyName(symbol),
      phone: '+91-22-12345678',
      shareOutstanding: 1000000,
      ticker: symbol,
      weburl: 'https://company.com',
      logo: '',
      finnhubIndustry: 'Technology'
    };
  }

  private getMockCandles() {
    const candles = [];
    const now = Date.now() / 1000;
    
    for (let i = 100; i >= 0; i--) {
      const timestamp = now - (i * 300); // 5-minute intervals
      const open = 19500 + Math.random() * 200;
      const close = open + (Math.random() - 0.5) * 50;
      const high = Math.max(open, close) + Math.random() * 20;
      const low = Math.min(open, close) - Math.random() * 20;
      
      candles.push({
        c: [close],
        h: [high],
        l: [low],
        o: [open],
        t: [timestamp],
        v: [Math.floor(Math.random() * 10000)]
      });
    }
    
    return candles;
  }

  private getBasePriceForSymbol(symbol: string): number {
    const prices: { [key: string]: number } = {
      'RELIANCE.NS': 2485,
      'TCS.NS': 3654,
      'HDFCBANK.NS': 1642,
      'INFY.NS': 1456,
      'ICICIBANK.NS': 985,
      '^NSEI': 19650,
      '^NSEBANK': 44250,
      default: 1000
    };
    
    return prices[symbol] || prices.default;
  }

  private getCompanyName(symbol: string): string {
    const names: { [key: string]: string } = {
      'RELIANCE.NS': 'Reliance Industries Ltd',
      'TCS.NS': 'Tata Consultancy Services',
      'HDFCBANK.NS': 'HDFC Bank Ltd',
      'INFY.NS': 'Infosys Ltd',
      '^NSEI': 'NIFTY 50',
      '^NSEBANK': 'BANK NIFTY'
    };
    
    return names[symbol] || 'Unknown Company';
  }
}

// Create singleton instance
export const finnhubApi = new FinnhubService(FINNHUB_API_KEY);

// WebSocket connection for real-time data
export class FinnhubWebSocket {
  private ws: WebSocket | null = null;
  private subscribers: Map<string, (data: any) => void> = new Map();

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);
    
    this.ws.onopen = () => {
      console.log('Finnhub WebSocket connected');
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'trade' && data.data) {
        data.data.forEach((trade: any) => {
          const callback = this.subscribers.get(trade.s);
          if (callback) {
            callback(trade);
          }
        });
      }
    };
    
    this.ws.onclose = () => {
      console.log('Finnhub WebSocket disconnected');
      // Auto reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };
    
    this.ws.onerror = (error) => {
      console.error('Finnhub WebSocket error:', error);
    };
  }

  subscribe(symbol: string, callback: (data: any) => void) {
    this.subscribers.set(symbol, callback);
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        symbol: symbol
      }));
    }
  }

  unsubscribe(symbol: string) {
    this.subscribers.delete(symbol);
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        symbol: symbol
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const finnhubWS = new FinnhubWebSocket();