// Options Trading Service - CE/PE Options Generation
import { finnhubApi } from './finnhubApi';

export interface OptionContract {
  symbol: string;
  strike: number;
  type: 'CE' | 'PE';
  expiry: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  bid: number;
  ask: number;
  lotSize: number;
}

export interface OptionsChain {
  underlyingSymbol: string;
  underlyingPrice: number;
  expiries: string[];
  strikes: number[];
  options: OptionContract[];
}

class OptionsService {
  // Generate options chain for Indian F&O
  async generateOptionsChain(symbol: string): Promise<OptionsChain> {
    try {
      // Get underlying price from Finnhub
      const quote = await finnhubApi.getQuote(symbol);
      const underlyingPrice = quote.c;
      
      // Generate expiry dates (Weekly & Monthly)
      const expiries = this.generateExpiries();
      
      // Generate strike prices around current price
      const strikes = this.generateStrikes(underlyingPrice);
      
      // Generate options contracts
      const options = this.generateOptions(symbol, underlyingPrice, strikes, expiries);
      
      return {
        underlyingSymbol: symbol,
        underlyingPrice,
        expiries,
        strikes,
        options
      };
    } catch (error) {
      console.error('Error generating options chain:', error);
      return this.getMockOptionsChain(symbol);
    }
  }

  // Generate weekly and monthly expiries
  private generateExpiries(): string[] {
    const expiries: string[] = [];
    const today = new Date();
    
    // Weekly expiries (next 4 Thursdays)
    for (let i = 1; i <= 4; i++) {
      const nextThursday = this.getNextThursday(today, i);
      expiries.push(this.formatDate(nextThursday));
    }
    
    // Monthly expiries (next 3 months' last Thursday)
    for (let i = 1; i <= 3; i++) {
      const monthlyExpiry = this.getMonthlyExpiry(today, i);
      if (!expiries.includes(this.formatDate(monthlyExpiry))) {
        expiries.push(this.formatDate(monthlyExpiry));
      }
    }
    
    return expiries.sort();
  }

  // Generate strike prices around current price
  private generateStrikes(currentPrice: number): number[] {
    const strikes: number[] = [];
    const strikeInterval = this.getStrikeInterval(currentPrice);
    
    // Generate 20 strikes on each side
    for (let i = -20; i <= 20; i++) {
      const strike = Math.round((currentPrice + (i * strikeInterval)) / strikeInterval) * strikeInterval;
      if (strike > 0) {
        strikes.push(strike);
      }
    }
    
    return [...new Set(strikes)].sort((a, b) => a - b);
  }

  // Generate options contracts (CE/PE)
  private generateOptions(
    symbol: string, 
    underlyingPrice: number, 
    strikes: number[], 
    expiries: string[]
  ): OptionContract[] {
    const options: OptionContract[] = [];
    
    expiries.forEach(expiry => {
      strikes.forEach(strike => {
        // Call Option (CE)
        const callOption = this.generateOptionContract(
          symbol, strike, 'CE', expiry, underlyingPrice
        );
        options.push(callOption);
        
        // Put Option (PE)
        const putOption = this.generateOptionContract(
          symbol, strike, 'PE', expiry, underlyingPrice
        );
        options.push(putOption);
      });
    });
    
    return options;
  }

  // Generate single option contract
  private generateOptionContract(
    symbol: string,
    strike: number,
    type: 'CE' | 'PE',
    expiry: string,
    underlyingPrice: number
  ): OptionContract {
    const daysToExpiry = this.getDaysToExpiry(expiry);
    const moneyness = type === 'CE' ? 
      (underlyingPrice - strike) / strike : 
      (strike - underlyingPrice) / strike;
    
    // Simple Black-Scholes approximation for option pricing
    const timeValue = Math.max(0, daysToExpiry / 365 * 0.2); // 20% volatility
    const intrinsicValue = Math.max(0, type === 'CE' ? 
      underlyingPrice - strike : 
      strike - underlyingPrice
    );
    
    const ltp = intrinsicValue + timeValue * Math.exp(-Math.abs(moneyness) * 2) * underlyingPrice * 0.05;
    const change = (Math.random() - 0.5) * ltp * 0.1; // Random change ±10%
    
    return {
      symbol: `${symbol.replace('.NS', '')}${this.formatExpiryCode(expiry)}${strike}${type}`,
      strike,
      type,
      expiry,
      ltp: Math.max(0.05, ltp + change), // Minimum 5 paisa
      change,
      changePercent: ltp > 0 ? (change / ltp) * 100 : 0,
      volume: Math.floor(Math.random() * 100000),
      openInterest: Math.floor(Math.random() * 500000),
      impliedVolatility: 15 + Math.random() * 25, // 15-40% IV
      bid: Math.max(0.05, ltp + change - 0.25),
      ask: ltp + change + 0.25,
      lotSize: this.getLotSize(symbol)
    };
  }

  // Helper methods
  private getNextThursday(date: Date, weeksAhead: number): Date {
    const result = new Date(date);
    const dayOfWeek = result.getDay();
    const daysToThursday = (4 - dayOfWeek + 7) % 7 || 7; // Thursday = 4
    result.setDate(result.getDate() + daysToThursday + (weeksAhead - 1) * 7);
    return result;
  }

  private getMonthlyExpiry(date: Date, monthsAhead: number): Date {
    const result = new Date(date.getFullYear(), date.getMonth() + monthsAhead, 1);
    // Last Thursday of the month
    const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0);
    const lastThursday = new Date(lastDay);
    const dayOfWeek = lastDay.getDay();
    const daysBack = (dayOfWeek + 3) % 7; // Days back to Thursday
    lastThursday.setDate(lastDay.getDate() - daysBack);
    return lastThursday;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  private formatExpiryCode(expiry: string): string {
    const date = new Date(expiry);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private getDaysToExpiry(expiry: string): number {
    const expiryDate = new Date(expiry);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  private getStrikeInterval(price: number): number {
    if (price < 500) return 10;
    if (price < 1000) return 25;
    if (price < 2000) return 50;
    if (price < 5000) return 100;
    if (price < 10000) return 200;
    return 500;
  }

  private getLotSize(symbol: string): number {
    const lotSizes: { [key: string]: number } = {
      '^NSEI': 50,      // Nifty
      '^NSEBANK': 25,   // Bank Nifty
      'RELIANCE.NS': 250,
      'TCS.NS': 150,
      'HDFCBANK.NS': 550,
      'INFY.NS': 300,
      'ICICIBANK.NS': 375
    };
    
    return lotSizes[symbol] || 100;
  }

  // Mock data for demo
  private getMockOptionsChain(symbol: string): OptionsChain {
    const mockPrice = 19650;
    const expiries = ['2024-01-25', '2024-02-01', '2024-02-29'];
    const strikes = [];
    
    for (let i = 19000; i <= 20300; i += 50) {
      strikes.push(i);
    }
    
    const options = this.generateOptions(symbol, mockPrice, strikes, expiries);
    
    return {
      underlyingSymbol: symbol,
      underlyingPrice: mockPrice,
      expiries,
      strikes,
      options
    };
  }
}

export const optionsService = new OptionsService();