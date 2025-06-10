import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Search, TrendingUp, TrendingDown, Filter, Zap } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { finnhubApi, INDIAN_FO_STOCKS, INDIAN_INDICES } from '@/services/finnhubApi';
import { subscriptionService } from '@/services/subscriptionService';

const marketData = [
  // Indices
  { symbol: 'NIFTY50', name: 'Nifty 50', ltp: 19650.30, change: 125.40, changePercent: 0.64, category: 'Index' },
  { symbol: 'BANKNIFTY', name: 'Bank Nifty', ltp: 44250.75, change: -185.20, changePercent: -0.42, category: 'Index' },
  { symbol: 'FINNIFTY', name: 'Fin Nifty', ltp: 19280.45, change: 95.30, changePercent: 0.50, category: 'Index' },
  
  // Stocks
  { symbol: 'RELIANCE', name: 'Reliance Industries', ltp: 2485.60, change: 15.80, changePercent: 0.64, category: 'Stock' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', ltp: 1642.30, change: -8.70, changePercent: -0.53, category: 'Stock' },
  { symbol: 'INFY', name: 'Infosys Limited', ltp: 1456.75, change: 12.45, changePercent: 0.86, category: 'Stock' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', ltp: 3654.80, change: -25.60, changePercent: -0.70, category: 'Stock' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', ltp: 985.40, change: 7.20, changePercent: 0.74, category: 'Stock' },
  { symbol: 'SBIN', name: 'State Bank of India', ltp: 598.25, change: -4.15, changePercent: -0.69, category: 'Stock' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', ltp: 1168.90, change: 18.35, changePercent: 1.59, category: 'Stock' },
  { symbol: 'LT', name: 'Larsen & Toubro', ltp: 2856.75, change: -12.80, changePercent: -0.45, category: 'Stock' },
  { symbol: 'WIPRO', name: 'Wipro Limited', ltp: 428.60, change: 3.75, changePercent: 0.88, category: 'Stock' },
];

const categories = ['All', 'Index', 'Stock'];

export default function MarketsScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    loadMarketData();
    checkSubscription();
    
    // Set up real-time updates every 5 seconds
    const interval = setInterval(loadMarketData, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkSubscription = async () => {
    const premium = await subscriptionService.isPremiumUser();
    setIsPremium(premium);
  };

  const loadMarketData = async () => {
    try {
      const allSymbols = [
        ...INDIAN_INDICES.map(index => ({ ...index, category: 'Index' })),
        ...INDIAN_FO_STOCKS.slice(0, 10).map(symbol => ({
          symbol,
          name: getCompanyName(symbol),
          category: 'Stock'
        }))
      ];

      const dataPromises = allSymbols.map(async (item) => {
        const quote = await finnhubApi.getQuote(item.symbol);
        return {
          symbol: item.symbol,
          name: item.name,
          ltp: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          category: item.category
        };
      });

      const data = await Promise.all(dataPromises);
      setMarketData(data);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyName = (symbol: string): string => {
    const names: { [key: string]: string } = {
      'RELIANCE.NS': 'Reliance Industries',
      'TCS.NS': 'Tata Consultancy Services',
      'HDFCBANK.NS': 'HDFC Bank',
      'INFY.NS': 'Infosys Limited',
      'ICICIBANK.NS': 'ICICI Bank'
    };
    return names[symbol] || symbol.replace('.NS', '');
  };

  const filteredData = marketData.filter(item => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchText.toLowerCase()) ||
                         item.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Markets</Text>
        <View style={styles.headerRight}>
          {!isPremium && (
            <TouchableOpacity 
              style={styles.premiumButton}
              onPress={() => router.push('/subscription')}
            >
              <Zap color="#FF9500" size={20} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.filterButton}>
            <Filter color="#007AFF" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search color="#8E8E93" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search stocks, indices..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#8E8E93"
        />
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Market Data List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredData.map((item, index) => (
          <Animated.View
            key={item.symbol}
            entering={FadeInDown.delay(index * 50).duration(400)}
          >
            <TouchableOpacity style={styles.stockItem}>
              <View style={styles.stockLeft}>
                <View style={styles.stockHeader}>
                  <Text style={styles.stockSymbol}>{item.symbol}</Text>
                  <View style={[
                    styles.categoryBadge,
                    { backgroundColor: item.category === 'Index' ? '#FF9500' : '#007AFF' }
                  ]}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>
                </View>
                <Text style={styles.stockName}>{item.name}</Text>
              </View>
              
              <View style={styles.stockRight}>
                <Text style={styles.stockPrice}>₹{item.ltp.toFixed(2)}</Text>
                <View style={styles.changeContainer}>
                  {item.change >= 0 ? (
                    <TrendingUp color="#34C759" size={16} />
                  ) : (
                    <TrendingDown color="#FF3B30" size={16} />
                  )}
                  <Text style={[
                    styles.changeText,
                    { color: item.change >= 0 ? '#34C759' : '#FF3B30' }
                  ]}>
                    {formatChange(item.change, item.changePercent)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
        
        {/* Bottom padding for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Options Button */}
      <TouchableOpacity 
        style={styles.optionsButton}
        onPress={() => router.push('/options')}
      >
        <Text style={styles.optionsButtonText}>Options</Text>
      </TouchableOpacity>
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
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  stockItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockLeft: {
    flex: 1,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stockName: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  stockRight: {
    alignItems: 'flex-end',
  },
  stockPrice: {
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
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumButton: {
    padding: 8,
    backgroundColor: '#FF950020',
    borderRadius: 8,
  },
  optionsButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  optionsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});