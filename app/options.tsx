import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { optionsService, OptionsChain } from '@/services/optionsService';
import { tradingService, TradeOrder } from '@/services/tradingService';
import { subscriptionService } from '@/services/subscriptionService';
import { useTrading } from '@/context/TradingContext';

export default function OptionsScreen() {
  const { state, dispatch } = useTrading();
  const [loading, setLoading] = useState(true);
  const [optionsChain, setOptionsChain] = useState<OptionsChain | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [selectedStrike, setSelectedStrike] = useState<number>(0);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadOptionsData();
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const premium = await subscriptionService.isPremiumUser();
    setIsPremium(premium);
  };

  const loadOptionsData = async () => {
    try {
      setLoading(true);
      // Load Nifty50 options by default
      const chain = await optionsService.generateOptionsChain('^NSEI');
      setOptionsChain(chain);
      setSelectedExpiry(chain.expiries[0]);
      setSelectedStrike(chain.underlyingPrice);
    } catch (error) {
      console.error('Error loading options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async (
    strike: number, 
    type: 'CE' | 'PE', 
    action: 'BUY' | 'SELL',
    price: number
  ) => {
    if (!isPremium) {
      Alert.alert(
        'Premium Feature',
        'Options trading requires premium subscription. Upgrade for just ₹10/month!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/subscription') }
        ]
      );
      return;
    }

    const order: TradeOrder = {
      symbol: '^NSEI',
      type: action,
      instrument: type,
      quantity: 50, // Nifty lot size
      price,
      orderType: 'MARKET',
      expiry: selectedExpiry,
      strike
    };

    const result = await tradingService.executeTrade(order, state.portfolio.availableBalance);
    
    if (result.success && result.trade) {
      dispatch({ type: 'ADD_TRADE', payload: result.trade });
      Alert.alert('Trade Successful', result.message || 'Trade executed successfully!');
    } else {
      Alert.alert('Trade Failed', result.error || 'Unknown error occurred');
    }
  };

  const getFilteredOptions = () => {
    if (!optionsChain) return { calls: [], puts: [] };

    const filtered = optionsChain.options.filter(
      option => option.expiry === selectedExpiry
    );

    // Get options around selected strike (±500 range)
    const strikeRange = filtered.filter(
      option => Math.abs(option.strike - selectedStrike) <= 500
    );

    const calls = strikeRange.filter(option => option.type === 'CE')
      .sort((a, b) => a.strike - b.strike);
    
    const puts = strikeRange.filter(option => option.type === 'PE')
      .sort((a, b) => a.strike - b.strike);

    return { calls, puts };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading Options Chain...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { calls, puts } = getFilteredOptions();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1C1C1E" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>NIFTY Options</Text>
          <Text style={styles.subtitle}>
            ₹{optionsChain?.underlyingPrice.toFixed(2)} 
            <TrendingUp color="#34C759" size={16} style={{ marginLeft: 8 }} />
          </Text>
        </View>
        <View style={styles.premiumBadge}>
          {isPremium ? (
            <Text style={styles.premiumText}>Premium</Text>
          ) : (
            <TouchableOpacity onPress={() => router.push('/subscription')}>
              <Zap color="#FF9500" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Expiry Selection */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.expiryScroll}
        contentContainerStyle={styles.expiryContainer}
      >
        {optionsChain?.expiries.map((expiry, index) => (
          <TouchableOpacity
            key={expiry}
            style={[
              styles.expiryButton,
              selectedExpiry === expiry && styles.expiryButtonActive
            ]}
            onPress={() => setSelectedExpiry(expiry)}
          >
            <Text style={[
              styles.expiryText,
              selectedExpiry === expiry && styles.expiryTextActive
            ]}>
              {new Date(expiry).toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'short' 
              })}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Options Chain Table */}
      <View style={styles.tableContainer}>
        {/* Header Row */}
        <View style={styles.tableHeader}>
          <View style={styles.callHeader}>
            <Text style={styles.headerText}>CALLS (CE)</Text>
          </View>
          <View style={styles.strikeHeader}>
            <Text style={styles.headerText}>STRIKE</Text>
          </View>
          <View style={styles.putHeader}>
            <Text style={styles.headerText}>PUTS (PE)</Text>
          </View>
        </View>

        {/* Options Data */}
        <ScrollView style={styles.optionsScroll} showsVerticalScrollIndicator={false}>
          {calls.map((callOption, index) => {
            const putOption = puts.find(p => p.strike === callOption.strike);
            const isATM = Math.abs(callOption.strike - (optionsChain?.underlyingPrice || 0)) < 50;
            
            return (
              <Animated.View
                key={callOption.strike}
                entering={FadeInDown.delay(index * 50).duration(300)}
                style={[styles.optionRow, isATM && styles.atmRow]}
              >
                {/* Call Option */}
                <TouchableOpacity 
                  style={styles.callCell}
                  onPress={() => handleTrade(callOption.strike, 'CE', 'BUY', callOption.ltp)}
                >
                  <Text style={styles.ltpText}>₹{callOption.ltp.toFixed(2)}</Text>
                  <View style={styles.changeContainer}>
                    {callOption.change >= 0 ? (
                      <TrendingUp color="#34C759" size={12} />
                    ) : (
                      <TrendingDown color="#FF3B30" size={12} />
                    )}
                    <Text style={[
                      styles.changeText,
                      { color: callOption.change >= 0 ? '#34C759' : '#FF3B30' }
                    ]}>
                      {callOption.changePercent.toFixed(1)}%
                    </Text>
                  </View>
                  <Text style={styles.volumeText}>Vol: {callOption.volume}</Text>
                </TouchableOpacity>

                {/* Strike Price */}
                <View style={[styles.strikeCell, isATM && styles.atmStrike]}>
                  <Text style={[styles.strikeText, isATM && styles.atmStrikeText]}>
                    {callOption.strike}
                  </Text>
                  {isATM && (
                    <View style={styles.atmBadge}>
                      <Text style={styles.atmBadgeText}>ATM</Text>
                    </View>
                  )}
                </View>

                {/* Put Option */}
                <TouchableOpacity 
                  style={styles.putCell}
                  onPress={() => putOption && handleTrade(putOption.strike, 'PE', 'BUY', putOption.ltp)}
                >
                  {putOption && (
                    <>
                      <Text style={styles.ltpText}>₹{putOption.ltp.toFixed(2)}</Text>
                      <View style={styles.changeContainer}>
                        {putOption.change >= 0 ? (
                          <TrendingUp color="#34C759" size={12} />
                        ) : (
                          <TrendingDown color="#FF3B30" size={12} />
                        )}
                        <Text style={[
                          styles.changeText,
                          { color: putOption.change >= 0 ? '#34C759' : '#FF3B30' }
                        ]}>
                          {putOption.changePercent.toFixed(1)}%
                        </Text>
                      </View>
                      <Text style={styles.volumeText}>Vol: {putOption.volume}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>

      {/* Market Status */}
      <View style={styles.marketStatus}>
        <Clock color="#8E8E93" size={16} />
        <Text style={styles.marketStatusText}>
          Market: {tradingService.isMarketOpen() ? 'Open' : 'Closed'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FF950020',
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
  },
  expiryScroll: {
    maxHeight: 60,
  },
  expiryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  expiryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  expiryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  expiryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  expiryTextActive: {
    color: '#FFFFFF',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  callHeader: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  strikeHeader: {
    width: 80,
    padding: 12,
    alignItems: 'center',
  },
  putHeader: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  optionsScroll: {
    flex: 1,
  },
  optionRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  atmRow: {
    backgroundColor: '#FFF9E6',
  },
  callCell: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  strikeCell: {
    width: 80,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atmStrike: {
    backgroundColor: '#FFE066',
  },
  putCell: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  ltpText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 2,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  volumeText: {
    fontSize: 10,
    color: '#8E8E93',
  },
  strikeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  atmStrikeText: {
    color: '#B8860B',
  },
  atmBadge: {
    backgroundColor: '#FF9500',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
  },
  atmBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  marketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    gap: 8,
  },
  marketStatusText: {
    fontSize: 14,
    color: '#8E8E93',
  },
});