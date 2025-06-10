import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrading } from '@/context/TradingContext';
import { TrendingUp, TrendingDown, Plus, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function PortfolioScreen() {
  const { state } = useTrading();
  const { portfolio } = state;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Mock positions for demo
  const mockPositions = [
    {
      id: '1',
      symbol: 'NIFTY50',
      instrument: 'CE' as const,
      strike: 19600,
      expiry: '2024-01-25',
      quantity: 50,
      avgPrice: 45.60,
      currentPrice: 67.30,
      pnl: 1085,
      pnlPercent: 47.6,
    },
    {
      id: '2',
      symbol: 'BANKNIFTY',
      instrument: 'PE' as const,
      strike: 44000,
      expiry: '2024-01-25',
      quantity: 25,
      avgPrice: 128.40,
      currentPrice: 98.75,
      pnl: -741.25,
      pnlPercent: -23.1,
    },
  ];

  const totalInvested = mockPositions.reduce((sum, pos) => sum + (pos.quantity * pos.avgPrice), 0);
  const currentValue = mockPositions.reduce((sum, pos) => sum + (pos.quantity * pos.currentPrice), 0);
  const totalPnL = currentValue - totalInvested;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus color="#007AFF" size={24} />
          </TouchableOpacity>
        </Animated.View>

        {/* Portfolio Summary */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <LinearGradient
            colors={totalPnL >= 0 ? ['#34C759', '#30D158'] : ['#FF3B30', '#FF453A']}
            style={styles.summaryCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Total P&L</Text>
              {totalPnL >= 0 ? (
                <TrendingUp color="#FFFFFF" size={24} />
              ) : (
                <TrendingDown color="#FFFFFF" size={24} />
              )}
            </View>
            
            <Text style={styles.totalPnL}>
              {formatCurrency(totalPnL)}
            </Text>
            
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Invested</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(totalInvested)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Current</Text>
                <Text style={styles.statValue}>
                  {formatCurrency(currentValue)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Positions */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Positions</Text>
            <Text style={styles.positionCount}>{mockPositions.length} Active</Text>
          </View>
          
          {mockPositions.map((position, index) => (
            <Animated.View
              key={position.id}
              entering={FadeInDown.delay(600 + index * 100).duration(600)}
              style={styles.positionCard}
            >
              <View style={styles.positionHeader}>
                <View style={styles.positionInfo}>
                  <Text style={styles.positionSymbol}>{position.symbol}</Text>
                  <View style={styles.positionDetails}>
                    <Text style={styles.positionType}>{position.strike} {position.instrument}</Text>
                    <View style={styles.expiryContainer}>
                      <Clock color="#8E8E93" size={12} />
                      <Text style={styles.expiryText}>{position.expiry}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.positionPnL}>
                  <Text style={[
                    styles.pnlAmount,
                    { color: position.pnl >= 0 ? '#34C759' : '#FF3B30' }
                  ]}>
                    {formatCurrency(position.pnl)}
                  </Text>
                  <Text style={[
                    styles.pnlPercent,
                    { color: position.pnl >= 0 ? '#34C759' : '#FF3B30' }
                  ]}>
                    {position.pnl >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                  </Text>
                </View>
              </View>
              
              <View style={styles.positionMetrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Qty</Text>
                  <Text style={styles.metricValue}>{position.quantity}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Avg Price</Text>
                  <Text style={styles.metricValue}>₹{position.avgPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>LTP</Text>
                  <Text style={styles.metricValue}>₹{position.currentPrice.toFixed(2)}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Recent Trades */}
        <Animated.View entering={FadeInDown.delay(800).duration(600)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Trades</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {portfolio.trades.slice(0, 3).map((trade, index) => (
            <View key={trade.id} style={styles.tradeItem}>
              <View style={styles.tradeInfo}>
                <Text style={styles.tradeSymbol}>{trade.symbol}</Text>
                <Text style={styles.tradeDetails}>
                  {trade.type} • {trade.quantity} • {trade.instrument}
                </Text>
              </View>
              
              <View style={styles.tradeRight}>
                <Text style={styles.tradePrice}>₹{trade.price.toFixed(2)}</Text>
                <Text style={styles.tradeTime}>
                  {formatDateTime(trade.timestamp)}
                </Text>
              </View>
            </View>
          ))}
          
          {portfolio.trades.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No trades yet</Text>
              <Text style={styles.emptySubtext}>Start trading to see your history here</Text>
            </View>
          )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  addButton: {
    padding: 8,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  totalPnL: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  summaryStats: {
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
  positionCount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  positionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  positionInfo: {
    flex: 1,
  },
  positionSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  positionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  positionType: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  expiryText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  positionPnL: {
    alignItems: 'flex-end',
  },
  pnlAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  pnlPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  positionMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  tradeItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradeInfo: {
    flex: 1,
  },
  tradeSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  tradeDetails: {
    fontSize: 14,
    color: '#8E8E93',
  },
  tradeRight: {
    alignItems: 'flex-end',
  },
  tradePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  tradeTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});