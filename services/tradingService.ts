// Real-time Trading Service - Instant Buy/Sell Execution
import { Trade, Position } from '../types/trading';
import { OptionContract } from './optionsService';

export interface TradeOrder {
  symbol: string;
  type: 'BUY' | 'SELL';
  instrument: 'FUTURES' | 'CE' | 'PE';
  quantity: number;
  price: number;
  orderType: 'MARKET' | 'LIMIT';
  expiry?: string;
  strike?: number;
}

export interface TradeResult {
  success: boolean;
  trade?: Trade;
  error?: string;
  message?: string;
}

class TradingService {
  // Execute trade instantly (like Groww/Zerodha)
  async executeTrade(order: TradeOrder, currentBalance: number): Promise<TradeResult> {
    try {
      // Validate order
      const validation = this.validateOrder(order, currentBalance);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Calculate trade value
      const tradeValue = order.quantity * order.price;
      
      // Create trade record
      const trade: Trade = {
        id: this.generateTradeId(),
        symbol: order.symbol,
        type: order.type,
        instrument: order.instrument,
        quantity: order.quantity,
        price: order.price,
        timestamp: Date.now(),
        expiry: order.expiry,
        strike: order.strike,
        currentPrice: order.price, // Will be updated real-time
        pnl: 0 // Initial P&L is 0
      };

      // Success message
      const message = this.generateTradeMessage(order);

      return {
        success: true,
        trade,
        message
      };

    } catch (error) {
      console.error('Trade execution error:', error);
      return {
        success: false,
        error: 'Trade execution failed. Please try again.'
      };
    }
  }

  // Validate trade order
  private validateOrder(order: TradeOrder, currentBalance: number): { isValid: boolean; error?: string } {
    // Check minimum quantity
    if (order.quantity <= 0) {
      return { isValid: false, error: 'Quantity must be greater than 0' };
    }

    // Check price
    if (order.price <= 0) {
      return { isValid: false, error: 'Price must be greater than 0' };
    }

    // Check balance for BUY orders
    if (order.type === 'BUY') {
      const tradeValue = order.quantity * order.price;
      if (tradeValue > currentBalance) {
        return { isValid: false, error: 'Insufficient balance' };
      }
    }

    // Check lot size validation for F&O
    if (order.instrument !== 'FUTURES') {
      const lotSize = this.getLotSize(order.symbol);
      if (order.quantity % lotSize !== 0) {
        return { 
          isValid: false, 
          error: `Quantity must be multiple of lot size (${lotSize})` 
        };
      }
    }

    return { isValid: true };
  }

  // Generate unique trade ID
  private generateTradeId(): string {
    return `TRD${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
  }

  // Generate trade confirmation message
  private generateTradeMessage(order: TradeOrder): string {
    const action = order.type === 'BUY' ? 'खरीदा' : 'बेचा';
    const instrumentText = this.getInstrumentText(order);
    
    return `${instrumentText} ${action} गया! Quantity: ${order.quantity}, Price: ₹${order.price.toFixed(2)}`;
  }

  // Get instrument display text
  private getInstrumentText(order: TradeOrder): string {
    if (order.instrument === 'FUTURES') {
      return `${order.symbol} Futures`;
    } else {
      return `${order.symbol} ${order.strike} ${order.instrument}`;
    }
  }

  // Calculate real-time P&L for positions
  calculatePositionPnL(position: Position, currentPrice: number): { pnl: number; pnlPercent: number } {
    const priceDiff = currentPrice - position.avgPrice;
    const pnl = priceDiff * position.quantity;
    const pnlPercent = (priceDiff / position.avgPrice) * 100;
    
    return { pnl, pnlPercent };
  }

  // Update position with current market price
  updatePosition(position: Position, currentPrice: number): Position {
    const { pnl, pnlPercent } = this.calculatePositionPnL(position, currentPrice);
    
    return {
      ...position,
      currentPrice,
      pnl,
      pnlPercent
    };
  }

  // Convert trades to positions
  convertTradesToPositions(trades: Trade[]): Position[] {
    const positionMap = new Map<string, Position>();

    trades.forEach(trade => {
      const positionKey = `${trade.symbol}-${trade.instrument}-${trade.strike}-${trade.expiry}`;
      
      if (positionMap.has(positionKey)) {
        const existingPosition = positionMap.get(positionKey)!;
        
        if (trade.type === 'BUY') {
          // Add to position
          const totalQuantity = existingPosition.quantity + trade.quantity;
          const totalValue = (existingPosition.quantity * existingPosition.avgPrice) + 
                           (trade.quantity * trade.price);
          const newAvgPrice = totalValue / totalQuantity;
          
          positionMap.set(positionKey, {
            ...existingPosition,
            quantity: totalQuantity,
            avgPrice: newAvgPrice
          });
        } else {
          // Reduce position
          const newQuantity = existingPosition.quantity - trade.quantity;
          if (newQuantity > 0) {
            positionMap.set(positionKey, {
              ...existingPosition,
              quantity: newQuantity
            });
          } else {
            positionMap.delete(positionKey);
          }
        }
      } else if (trade.type === 'BUY') {
        // Create new position
        const position: Position = {
          id: trade.id,
          symbol: trade.symbol,
          instrument: trade.instrument,
          quantity: trade.quantity,
          avgPrice: trade.price,
          currentPrice: trade.currentPrice || trade.price,
          pnl: 0,
          pnlPercent: 0,
          expiry: trade.expiry,
          strike: trade.strike
        };
        
        positionMap.set(positionKey, position);
      }
    });

    return Array.from(positionMap.values());
  }

  // Get lot size for symbol
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

  // Generate opportunity alerts
  generateOpportunityAlert(option: OptionContract, previousPrice: number): string | null {
    const priceDiff = option.ltp - previousPrice;
    const profit = Math.abs(priceDiff * option.lotSize);
    
    if (Math.abs(priceDiff) > previousPrice * 0.15 && profit > 500) { // 15% move and min ₹500 profit
      const action = priceDiff > 0 ? 'लिया होता' : 'बेचा होता';
      const currentAction = priceDiff > 0 ? 'मिलते' : 'बचते';
      
      return `Agar ${option.symbol} ${action} ₹${previousPrice.toFixed(2)} पर, तो अभी ₹${option.ltp.toFixed(2)} ${currentAction} = ₹${profit.toFixed(0)} का फायदा`;
    }
    
    return null;
  }

  // Calculate margin requirement
  calculateMargin(order: TradeOrder): number {
    if (order.instrument === 'FUTURES') {
      return order.quantity * order.price * 0.15; // 15% margin for futures
    } else {
      return order.quantity * order.price; // Full premium for options
    }
  }

  // Get market hours status
  isMarketOpen(): boolean {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const day = now.getDay();
    
    // Market closed on weekends
    if (day === 0 || day === 6) return false;
    
    // Market hours: 9:15 AM to 3:30 PM
    const marketStart = 9 * 60 + 15; // 9:15 AM in minutes
    const marketEnd = 15 * 60 + 30;  // 3:30 PM in minutes
    const currentTime = hours * 60 + minutes;
    
    return currentTime >= marketStart && currentTime <= marketEnd;
  }
}

export const tradingService = new TradingService();