import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTrading } from '@/context/TradingContext';
import { TrendingUp, TrendingDown, Eye, Plus, ArrowUpRight, ArrowDownRight, Crown } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { finnhubApi, INDIAN_INDICES } from '@/services/finnhubApi';
import { subscriptionService } from '@/services/subscriptionService';

const mockWatchlist = [
  { symbol: 'NIFTY50', name: 'Nifty 50', ltp: 19650.30, change: 125.40, changePercent: 0.64 },
  { symbol: 'BANKNIFTY', name: 'Bank Nifty', ltp: 44250.75, change: -185.20, changePercent: -0.42 },
  { symbol: 'RELIANCE', name: 'Reliance Industries', ltp: 2485.60, change: 15.80, changePercent: 0.64 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', ltp: 1642.30, change: -8.70, changePercent: -0.53 },
];

export default function HomeScreen() {
  const { state } = useTrading();
  const { portfolio } = state;
  const [mockWatchlist, setMockWatchlist] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadWatchlistData();
    checkSubscription();
    
    // Update every 10 seconds
    const interval = setInterval(loadWatchlistData, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkSubscription = async () => {
    const premium = await subscriptionService.isPremiumUser();
    setIsPremium(premium);
  };

  const loadWatchlistData = async () => {
    try {
      const watchlistSymbols = [
        { symbol: '^NSEI', name: 'Nifty 50' },
        { symbol: '^NSEBANK', name: 'Bank Nifty' },
        { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
        { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' }
      ];

      const dataPromises = watchlistSymbols.map(async (item) => {
        const quote = await finnhubApi.getQuote(item.symbol);
        return {
          symbol: item.symbol,
          name: item.name,
          ltp: quote.c,
          change: quote.d,
          changePercent: quote.dp
        };
      });

      const data = await Promise.all(dataPromises);
      setMockWatchlist(data);
    } catch (error) {
      console.error('Error loading watchlist:', error);
      // Keep existing mock data on error
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.subtitle}>Ready to trade today?</Text>
          </View>
          {!isPremium && (
            <TouchableOpacity 
              style={styles.premiumBadge}
              onPress={() => router.push('/subscription')}
            >
              <Crown color="#FFD700" size={20} />
              <Text style={styles.premiumText}>Premium</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Wallet Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <LinearGradient
            colors={['#007AFF', '#5856D6']}
            style={styles.walletCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.walletHeader}>
              <Text style={styles.walletTitle}>Virtual Wallet</Text>
              <TouchableOpacity style={styles.eyeButton}>
                <Eye color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.totalBalance}>
              {formatCurrency(portfolio.totalBalance)}
            </Text>
            
            <View style={styles.walletStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Available</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(portfolio.availableBalance)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>P&L Today</Text>
                <Text style={[
                  styles.statValue,
                  { color: portfolio.dayPnL >= 0 ? '#34C759' : '#FF3B30' }
                ]}>
                  {formatCurrency(portfolio.dayPnL)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#34C759' }]}
              onPress={() => router.push('/options')}
            >
              <ArrowUpRight color="#FFFFFF" size={24} />
              <Text style={styles.actionText}>Buy CE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
              onPress={() => router.push('/options')}
            >
              <ArrowDownRight color="#FFFFFF" size={24} />
              <Text style={styles.actionText}>Buy PE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FF9500' }]}
              onPress={() => router.push('/(tabs)/markets')}
            >
              <Plus color="#FFFFFF" size={24} />
              <Text style={styles.actionText}>Watchlist</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Market Overview */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Market Overview</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/markets')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {mockWatchlist.map((stock, index) => (
            <Animated.View
              key={stock.symbol}
              entering={FadeInDown.delay(800 + index * 100).duration(600)}
              style={styles.stockCard}
            >
              <View style={styles.stockInfo}>
                <Text style={styles.stockSymbol}>{stock.symbol.replace('^', '').replace('.NS', '')}</Text>
                <Text style={styles.stockName}>{stock.name}</Text>
              </View>
              
              <View style={styles.stockPrice}>
                <Text style={styles.ltp}>₹{stock.ltp.toFixed(2)}</Text>
                <View style={styles.changeContainer}>
                  {stock.change >= 0 ? (
                    <TrendingUp color="#34C759" size={16} />
                  ) : (
                    <TrendingDown color="#FF3B30" size={16} />
                  )}
                  <Text style={[
                    styles.change,
                    { color: stock.change >= 0 ? '#34C759' : '#FF3B30' }
                  ]}>
                    {formatChange(stock.change, stock.changePercent)}
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B8860B',
  },
  walletCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 24,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  eyeButton: {
    padding: 4,
  },
  totalBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  walletStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  viewAll: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  stockName: {
    fontSize: 14,
    color: '#8E8E93',
  },
  stockPrice: {
    alignItems: 'flex-end',
  },
  ltp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: '600',
  },
});