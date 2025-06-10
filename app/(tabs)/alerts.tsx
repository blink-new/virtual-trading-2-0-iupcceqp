import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrading } from '@/context/TradingContext';
import { TrendingUp, Bell, Target, AlertTriangle, Settings } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const mockAlerts = [
  {
    id: '1',
    type: 'OPPORTUNITY' as const,
    title: 'Missed Opportunity Alert',
    message: 'Agar NIFTY 19600 CE लिया होता ₹45 पर, तो अभी ₹67 मिलते = ₹1,100 का फायदा',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    symbol: 'NIFTY50',
    isRead: false,
  },
  {
    id: '2',
    type: 'TARGET' as const,
    title: 'Target Achieved!',
    message: 'BANKNIFTY 44000 PE has reached your target price of ₹95',
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    symbol: 'BANKNIFTY',
    isRead: true,
  },
  {
    id: '3',
    type: 'OPPORTUNITY' as const,
    title: 'High Volatility Alert',
    message: 'RELIANCE options showing unusual activity. ATM options premium increased by 15%',
    timestamp: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    symbol: 'RELIANCE',
    isRead: false,
  },
  {
    id: '4',
    type: 'STOP_LOSS' as const,
    title: 'Stop Loss Triggered',
    message: 'Your HDFC Bank 1650 CE position has hit stop loss at ₹25',
    timestamp: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
    symbol: 'HDFCBANK',
    isRead: true,
  },
];

export default function AlertsScreen() {
  const { state, dispatch } = useTrading();

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'OPPORTUNITY':
        return <TrendingUp color="#FF9500" size={20} />;
      case 'TARGET':
        return <Target color="#34C759" size={20} />;
      case 'STOP_LOSS':
        return <AlertTriangle color="#FF3B30" size={20} />;
      default:
        return <Bell color="#007AFF" size={20} />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'OPPORTUNITY':
        return '#FF9500';
      case 'TARGET':
        return '#34C759';
      case 'STOP_LOSS':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };

  const markAsRead = (alertId: string) => {
    dispatch({ type: 'MARK_ALERT_READ', payload: alertId });
  };

  const unreadCount = mockAlerts.filter(alert => !alert.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Alerts</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings color="#007AFF" size={24} />
        </TouchableOpacity>
      </Animated.View>

      {/* Alert Settings */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Smart Alerts</Text>
        <Text style={styles.settingsSubtitle}>
          Get notified about missed opportunities and market movements
        </Text>
        
        <View style={styles.alertTypes}>
          <View style={styles.alertType}>
            <View style={[styles.alertTypeIcon, { backgroundColor: '#FF950020' }]}>
              <TrendingUp color="#FF9500" size={16} />
            </View>
            <Text style={styles.alertTypeText}>Opportunities</Text>
          </View>
          
          <View style={styles.alertType}>
            <View style={[styles.alertTypeIcon, { backgroundColor: '#34C75920' }]}>
              <Target color="#34C759" size={16} />
            </View>
            <Text style={styles.alertTypeText}>Targets</Text>
          </View>
          
          <View style={styles.alertType}>
            <View style={[styles.alertTypeIcon, { backgroundColor: '#FF3B3020' }]}>
              <AlertTriangle color="#FF3B30" size={16} />
            </View>
            <Text style={styles.alertTypeText}>Stop Loss</Text>
          </View>
        </View>
      </Animated.View>

      {/* Alerts List */}
      <ScrollView style={styles.alertsList} showsVerticalScrollIndicator={false}>
        {mockAlerts.map((alert, index) => (
          <Animated.View
            key={alert.id}
            entering={FadeInDown.delay(400 + index * 100).duration(600)}
          >
            <TouchableOpacity
              style={[
                styles.alertItem,
                !alert.isRead && styles.alertItemUnread
              ]}
              onPress={() => markAsRead(alert.id)}
            >
              <View style={styles.alertLeft}>
                <View style={[
                  styles.alertIconContainer,
                  { backgroundColor: getAlertColor(alert.type) + '20' }
                ]}>
                  {getAlertIcon(alert.type)}
                </View>
                
                <View style={styles.alertContent}>
                  <View style={styles.alertHeader}>
                    <Text style={[
                      styles.alertTitle,
                      !alert.isRead && styles.alertTitleUnread
                    ]}>
                      {alert.title}
                    </Text>
                    {!alert.isRead && <View style={styles.unreadDot} />}
                  </View>
                  
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  
                  <View style={styles.alertFooter}>
                    {alert.symbol && (
                      <Text style={styles.alertSymbol}>{alert.symbol}</Text>
                    )}
                    <Text style={styles.alertTime}>{formatTime(alert.timestamp)}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
        
        {mockAlerts.length === 0 && (
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.emptyState}
          >
            <Bell color="#8E8E93" size={48} />
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptySubtitle}>
              We'll notify you about trading opportunities and market movements
            </Text>
          </Animated.View>
        )}
        
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  alertTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertType: {
    alignItems: 'center',
    gap: 8,
  },
  alertTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTypeText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  alertsList: {
    flex: 1,
  },
  alertItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
  },
  alertItemUnread: {
    backgroundColor: '#F8F9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  alertLeft: {
    flexDirection: 'row',
    gap: 12,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  alertTitleUnread: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  alertMessage: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
    marginBottom: 8,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertSymbol: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    backgroundColor: '#007AFF20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});