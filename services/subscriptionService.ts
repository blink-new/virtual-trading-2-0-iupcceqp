// Subscription Service - ₹10/month Premium Features
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // days
  features: string[];
  isPopular?: boolean;
}

export interface UserSubscription {
  planId: string;
  startDate: number;
  endDate: number;
  isActive: boolean;
  autoRenew: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 10,
    duration: 30,
    isPopular: true,
    features: [
      'Real-time market data',
      'Unlimited trades',
      'Advanced charts',
      'Options chain access',
      'Smart alerts',
      'Portfolio analytics',
      'Priority support'
    ]
  },
  {
    id: 'premium_quarterly',
    name: 'Premium Quarterly',
    price: 25,
    duration: 90,
    features: [
      'All monthly features',
      '₹5 discount (17% off)',
      'Extended analytics',
      'Custom watchlists'
    ]
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 99,
    duration: 365,
    features: [
      'All quarterly features',
      '₹21 discount (18% off)',
      'Lifetime updates',
      'Premium community access'
    ]
  }
];

export const FREE_FEATURES = [
  'Basic market data (15-min delay)',
  '5 trades per day',
  'Basic charts',
  'Limited watchlist (10 stocks)',
  'Community support'
];

class SubscriptionService {
  private static readonly STORAGE_KEY = 'user_subscription';

  // Get current subscription status
  async getCurrentSubscription(): Promise<UserSubscription | null> {
    try {
      const subscriptionData = await AsyncStorage.getItem(SubscriptionService.STORAGE_KEY);
      if (!subscriptionData) return null;

      const subscription: UserSubscription = JSON.parse(subscriptionData);
      
      // Check if subscription is still active
      if (subscription.endDate < Date.now()) {
        subscription.isActive = false;
        await this.saveSubscription(subscription);
      }

      return subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  // Check if user has active premium subscription
  async isPremiumUser(): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();
    return subscription?.isActive ?? false;
  }

  // Subscribe to a plan (Mock payment integration)
  async subscribeToPlan(planId: string): Promise<{ success: boolean; message: string }> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        return { success: false, message: 'Invalid plan selected' };
      }

      // Mock payment processing
      const paymentSuccess = await this.processPayment(plan.price);
      if (!paymentSuccess) {
        return { success: false, message: 'Payment failed. Please try again.' };
      }

      // Create subscription
      const subscription: UserSubscription = {
        planId: plan.id,
        startDate: Date.now(),
        endDate: Date.now() + (plan.duration * 24 * 60 * 60 * 1000),
        isActive: true,
        autoRenew: false
      };

      await this.saveSubscription(subscription);

      return { 
        success: true, 
        message: `${plan.name} activated successfully! Enjoy premium features for ${plan.duration} days.` 
      };
    } catch (error) {
      console.error('Subscription error:', error);
      return { success: false, message: 'Subscription failed. Please try again.' };
    }
  }

  // Cancel subscription
  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    try {
      const subscription = await this.getCurrentSubscription();
      if (!subscription || !subscription.isActive) {
        return { success: false, message: 'No active subscription found' };
      }

      subscription.autoRenew = false;
      await this.saveSubscription(subscription);

      return { 
        success: true, 
        message: 'Subscription cancelled. You can continue using premium features until expiry.' 
      };
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return { success: false, message: 'Failed to cancel subscription' };
    }
  }

  // Get days remaining in subscription
  async getDaysRemaining(): Promise<number> {
    const subscription = await this.getCurrentSubscription();
    if (!subscription || !subscription.isActive) return 0;

    const timeRemaining = subscription.endDate - Date.now();
    return Math.max(0, Math.ceil(timeRemaining / (24 * 60 * 60 * 1000)));
  }

  // Check if feature is available for current user
  async canAccessFeature(feature: string): Promise<boolean> {
    const isPremium = await this.isPremiumUser();
    
    // Free features available to all
    const freeFeaturesList = [
      'basic_charts',
      'limited_watchlist',
      'basic_market_data',
      'community_support'
    ];

    if (freeFeaturesList.includes(feature)) {
      return true;
    }

    // Premium features require subscription
    const premiumFeatures = [
      'real_time_data',
      'unlimited_trades',
      'options_chain',
      'smart_alerts',
      'advanced_charts',
      'portfolio_analytics'
    ];

    if (premiumFeatures.includes(feature)) {
      return isPremium;
    }

    return false;
  }

  // Get subscription info for display
  async getSubscriptionInfo(): Promise<{
    isActive: boolean;
    planName?: string;
    daysRemaining?: number;
    features: string[];
  }> {
    const subscription = await this.getCurrentSubscription();
    const isPremium = await this.isPremiumUser();
    
    if (isPremium && subscription) {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.planId);
      const daysRemaining = await this.getDaysRemaining();
      
      return {
        isActive: true,
        planName: plan?.name || 'Premium',
        daysRemaining,
        features: plan?.features || []
      };
    }

    return {
      isActive: false,
      features: FREE_FEATURES
    };
  }

  // Private methods
  private async saveSubscription(subscription: UserSubscription): Promise<void> {
    await AsyncStorage.setItem(
      SubscriptionService.STORAGE_KEY, 
      JSON.stringify(subscription)
    );
  }

  private async processPayment(amount: number): Promise<boolean> {
    // Mock payment processing - always succeeds for demo
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Processing payment of ₹${amount}...`);
        resolve(true); // Always success for demo
      }, 1000);
    });
  }

  // Get feature limits for free users
  async getFeatureLimits(): Promise<{
    tradesPerDay: number;
    watchlistLimit: number;
    dataDelay: number; // minutes
  }> {
    const isPremium = await this.isPremiumUser();
    
    if (isPremium) {
      return {
        tradesPerDay: -1, // Unlimited
        watchlistLimit: -1, // Unlimited
        dataDelay: 0 // Real-time
      };
    }

    return {
      tradesPerDay: 5,
      watchlistLimit: 10,
      dataDelay: 15 // 15-minute delay
    };
  }

  // Track feature usage
  async trackFeatureUsage(feature: string): Promise<void> {
    try {
      const usageKey = `usage_${feature}_${new Date().toDateString()}`;
      const currentUsage = await AsyncStorage.getItem(usageKey);
      const usage = currentUsage ? parseInt(currentUsage) : 0;
      
      await AsyncStorage.setItem(usageKey, (usage + 1).toString());
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  }

  // Check if daily limit exceeded
  async isDailyLimitExceeded(feature: string, limit: number): Promise<boolean> {
    if (limit === -1) return false; // Unlimited
    
    try {
      const usageKey = `usage_${feature}_${new Date().toDateString()}`;
      const currentUsage = await AsyncStorage.getItem(usageKey);
      const usage = currentUsage ? parseInt(currentUsage) : 0;
      
      return usage >= limit;
    } catch (error) {
      console.error('Error checking daily limit:', error);
      return false;
    }
  }
}

export const subscriptionService = new SubscriptionService();