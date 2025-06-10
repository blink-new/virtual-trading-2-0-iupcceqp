import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrading } from '@/context/TradingContext';
import { 
  User, 
  Settings, 
  Bell, 
  HelpCircle, 
  Shield, 
  Moon, 
  BarChart3,
  TrendingUp,
  Award,
  ChevronRight,
  RefreshCw
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { state } = useTrading();
  const { portfolio } = state;
  
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const resetPortfolio = () => {
    // Reset portfolio to initial state
    console.log('Reset portfolio');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </Animated.View>

        {/* User Info Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <LinearGradient
            colors={['#5856D6', '#AF52DE']}
            style={styles.userCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User color="#FFFFFF" size={32} />
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Virtual Trader</Text>
              <Text style={styles.userSubtitle}>Learning F&O Trading</Text>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{portfolio.trades.length}</Text>
                <Text style={styles.statLabel}>Trades</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{portfolio.positions.length}</Text>
                <Text style={styles.statLabel}>Positions</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Performance Stats */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          
          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <View style={styles.performanceIcon}>
                <BarChart3 color="#007AFF" size={24} />
              </View>
              <Text style={styles.performanceValue}>
                {formatCurrency(portfolio.totalBalance)}
              </Text>
              <Text style={styles.performanceLabel}>Total Balance</Text>
            </View>
            
            <View style={styles.performanceCard}>
              <View style={styles.performanceIcon}>
                <TrendingUp color="#34C759" size={24} />
              </View>
              <Text style={styles.performanceValue}>
                {formatCurrency(portfolio.totalPnL)}
              </Text>
              <Text style={styles.performanceLabel}>Total P&L</Text>
            </View>
            
            <View style={styles.performanceCard}>
              <View style={styles.performanceIcon}>
                <Award color="#FF9500" size={24} />
              </View>
              <Text style={styles.performanceValue}>Beginner</Text>
              <Text style={styles.performanceLabel}>Trader Level</Text>
            </View>
          </View>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsGroup}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#007AFF20' }]}>
                  <Bell color="#007AFF" size={20} />
                </View>
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E5E5E7', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#5856D620' }]}>
                  <Moon color="#5856D6" size={20} />
                </View>
                <Text style={styles.settingText}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E5E5E7', true: '#5856D6' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(800).duration(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          
          <View style={styles.actionsGroup}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: '#34C75920' }]}>
                  <HelpCircle color="#34C759" size={20} />
                </View>
                <Text style={styles.actionText}>Help & Support</Text>
              </View>
              <ChevronRight color="#8E8E93" size={20} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: '#8E8E9320' }]}>
                  <Shield color="#8E8E93" size={20} />
                </View>
                <Text style={styles.actionText}>Privacy Policy</Text>
              </View>
              <ChevronRight color="#8E8E93" size={20} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={resetPortfolio}>
              <View style={styles.actionLeft}>
                <View style={[styles.actionIcon, { backgroundColor: '#FF950020' }]}>
                  <RefreshCw color="#FF9500" size={20} />
                </View>
                <Text style={styles.actionText}>Reset Portfolio</Text>
              </View>
              <ChevronRight color="#8E8E93" size={20} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* App Info */}
        <Animated.View entering={FadeInDown.delay(1000).duration(600)} style={styles.section}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Virtual Trading 2.0</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              Educational F&O Trading Simulator
            </Text>
            <Text style={styles.disclaimer}>
              This app is for educational purposes only. All trades are virtual and do not involve real money.
            </Text>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  userCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  performanceGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  performanceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  performanceIcon: {
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
    textAlign: 'center',
  },
  performanceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  actionsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  appInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
});