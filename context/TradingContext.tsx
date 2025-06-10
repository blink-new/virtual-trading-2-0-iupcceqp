import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Portfolio, Trade, Position, Stock, Alert } from '../types/trading';
import { tradingService } from '../services/tradingService';

interface TradingState {
  portfolio: Portfolio;
  watchlist: Stock[];
  alerts: Alert[];
  isLoading: boolean;
}

type TradingAction =
  | { type: 'SET_PORTFOLIO'; payload: Portfolio }
  | { type: 'ADD_TRADE'; payload: Trade }
  | { type: 'UPDATE_POSITIONS'; payload: Position[] }
  | { type: 'SET_WATCHLIST'; payload: Stock[] }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'MARK_ALERT_READ'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

const initialPortfolio: Portfolio = {
  totalBalance: 100000, // ₹1,00,000
  availableBalance: 100000,
  totalPnL: 0,
  dayPnL: 0,
  positions: [],
  trades: [],
};

const initialState: TradingState = {
  portfolio: initialPortfolio,
  watchlist: [],
  alerts: [],
  isLoading: false,
};

function tradingReducer(state: TradingState, action: TradingAction): TradingState {
  switch (action.type) {
    case 'SET_PORTFOLIO':
      return { ...state, portfolio: action.payload };
    
    case 'ADD_TRADE': {
      const trade = action.payload;
      const newTrades = [...state.portfolio.trades, trade];
      
      // Update available balance
      const tradeValue = trade.quantity * trade.price;
      const newAvailableBalance = trade.type === 'BUY' 
        ? state.portfolio.availableBalance - tradeValue
        : state.portfolio.availableBalance + tradeValue;
      
      // Recalculate positions
      const newPositions = tradingService.convertTradesToPositions(newTrades);
      
      return {
        ...state,
        portfolio: {
          ...state.portfolio,
          trades: newTrades,
          availableBalance: Math.max(0, newAvailableBalance),
          positions: newPositions,
        },
      };
    }
    
    case 'UPDATE_POSITIONS': {
      // Calculate total P&L from positions
      const totalPnL = action.payload.reduce((sum, position) => sum + position.pnl, 0);
      
      return {
        ...state,
        portfolio: {
          ...state.portfolio,
          positions: action.payload,
          totalPnL,
          dayPnL: totalPnL, // Simplified - in real app, track daily changes
        },
      };
    }
    
    case 'SET_WATCHLIST':
      return { ...state, watchlist: action.payload };
    
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    
    case 'MARK_ALERT_READ':
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === action.payload ? { ...alert, isRead: true } : alert
        ),
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
}

const TradingContext = createContext<{
  state: TradingState;
  dispatch: React.Dispatch<TradingAction>;
} | null>(null);

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tradingReducer, initialState);

  // Load data from AsyncStorage on app start
  useEffect(() => {
    loadPortfolioData();
  }, []);

  // Save data to AsyncStorage whenever portfolio changes
  useEffect(() => {
    savePortfolioData();
  }, [state.portfolio]);

  const loadPortfolioData = async () => {
    try {
      const savedPortfolio = await AsyncStorage.getItem('portfolio');
      if (savedPortfolio) {
        dispatch({ type: 'SET_PORTFOLIO', payload: JSON.parse(savedPortfolio) });
      }
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    }
  };

  const savePortfolioData = async () => {
    try {
      await AsyncStorage.setItem('portfolio', JSON.stringify(state.portfolio));
    } catch (error) {
      console.error('Error saving portfolio data:', error);
    }
  };

  return (
    <TradingContext.Provider value={{ state, dispatch }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
}