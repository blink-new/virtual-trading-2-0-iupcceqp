import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Check, 
  Crown, 
  Zap, 
  TrendingUp, 
  BarChart3, 
  Bell,
  Shield
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { 
  subscriptionService, 
  SUBSCRIPTION_PLANS, 
  FREE_FEATURES 
} from '@/services/subscriptionService';

export default function SubscriptionScreen() {
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium_monthly');
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const subscription = await subscriptionService.getCurrentSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing(true);
      
      const result = await subscriptionService.subscribeToPlan(planId);
      
      if (result.success) {
        Alert.alert(
          'Subscription Successful! 🎉',
          result.message,
          [
            { 
              text: 'Start Trading', 
              onPress: () => router.back()
            }
          ]
        );
        loadSubscriptionData();
      } else {
        Alert.alert('Subscription Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your premium subscription?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const result = await subscriptionService.cancelSubscription();
            Alert.alert(
              result.success ? 'Cancelled' : 'Error',
              result.message
            );
            if (result.success) {
              loadSubscriptionData();
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentlyPremium = currentSubscription?.isActive;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1C1C1E" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Premium Subscription</Text>
          <View style={styles.crownIcon}>
            <Crown color="#FFD700" size={24} />
          </View>
        </Animated.View>

        {/* Current Status */}
        {isCurrentlyPremium && (
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <LinearGradient
              colors={['#34C759', '#30D158']}
              style={styles.statusCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statusHeader}>
                <Shield color="#FFFFFF" size={24} />
                <Text style={styles.statusTitle}>Premium Active</Text>
              </View>
              <Text style={styles.statusText}>
                You have full access to all premium features
              </Text>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelSubscription}
              >
                <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Benefits Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Why Go Premium?</Text>
          
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Zap color="#FF9500" size={20} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Real-time Data</Text>
                <Text style={styles.benefitDescription}>
                  Live market prices, instant updates
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <TrendingUp color="#34C759" size={20} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Unlimited Trading</Text>
                <Text style={styles.benefitDescription}>
                  No daily limits, trade as much as you want
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <BarChart3 color="#007AFF" size={20} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Advanced Charts</Text>
                <Text style={styles.benefitDescription}>
                  Professional trading charts & indicators
                </Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Bell color="#5856D6" size={20} />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>Smart Alerts</Text>
                <Text style={styles.benefitDescription}>
                  AI-powered trading opportunities
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Pricing Plans */}
        {!isCurrentlyPremium && (
          <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            
            {SUBSCRIPTION_PLANS.map((plan, index) => (
              <Animated.View
                key={plan.id}
                entering={FadeInDown.delay(800 + index * 100).duration(600)}
              >
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.planCardSelected,
                    plan.isPopular && styles.popularPlan
                  ]}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  {plan.isPopular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                    </View>
                  )}
                  
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.planPrice}>
                      <Text style={styles.priceAmount}>₹{plan.price}</Text>
                      <Text style={styles.priceUnit}>/{plan.duration} days</Text>
                    </View>
                  </View>
                  
                  <View style={styles.planFeatures}>
                    {plan.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <Check color="#34C759" size={16} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                  
                  {selectedPlan === plan.id && (
                    <TouchableOpacity
                      style={styles.subscribeButton}
                      onPress={() => handleSubscribe(plan.id)}
                      disabled={subscribing}
                    >
                      {subscribing ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.subscribeButtonText}>
                          Subscribe Now
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {/* Free Features */}
        <Animated.View entering={FadeInDown.delay(1000).duration(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Free Features</Text>
          
          <View style={styles.freeCard}>
            {FREE_FEATURES.map((feature, index) => (
              <View key={index} style={styles.freeFeatureItem}>
                <Check color="#8E8E93" size={16} />
                <Text style={styles.freeFeatureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Disclaimer */}
        <Animated.View entering={FadeInDown.delay(1200).duration(600)} style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            * All trades are virtual and for educational purposes only. 
            No real money is involved. Cancel anytime.
          </Text>
        </Animated.View>

        {/* Bottom padding */}
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
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  crownIcon: {
    padding: 8,
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  benefitsContainer: {
    gap: 16,
  },
  benefitItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#007AFF',
  },
  popularPlan: {
    borderColor: '#FF9500',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#FF9500',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  planPrice: {
    alignItems: 'flex-end',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  priceUnit: {
    fontSize: 12,
    color: '#8E8E93',
  },
  planFeatures: {
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  subscribeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  freeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  freeFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  freeFeatureText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  disclaimer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
  },
});