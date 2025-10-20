import type { SubscriptionPlan, Feature } from '@/lib/types/subscription'

// Feature definitions
export const FEATURES: Feature[] = [
  {
    id: 'campaigns',
    name: 'Campaigns',
    description: 'Create and manage advertising campaigns',
    requiredTier: 'free',
    isEnabled: true,
  },
  {
    id: 'unlimited_campaigns',
    name: 'Unlimited Campaigns',
    description: 'Create unlimited advertising campaigns',
    requiredTier: 'pro',
    isEnabled: false,
    upgradePrompt: 'Upgrade to Pro to create unlimited campaigns',
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Access to detailed performance analytics and insights',
    requiredTier: 'pro',
    isEnabled: false,
    upgradePrompt: 'Upgrade to Pro for advanced analytics',
  },
  {
    id: 'team_management',
    name: 'Team Management',
    description: 'Add team members and manage permissions',
    requiredTier: 'pro',
    isEnabled: false,
    upgradePrompt: 'Upgrade to Pro for team management features',
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Get priority customer support',
    requiredTier: 'pro',
    isEnabled: false,
    upgradePrompt: 'Upgrade to Pro for priority support',
  },
  {
    id: 'custom_integrations',
    name: 'Custom Integrations',
    description: 'Custom API integrations and webhooks',
    requiredTier: 'enterprise',
    isEnabled: false,
    upgradePrompt: 'Upgrade to Enterprise for custom integrations',
  },
  {
    id: 'dedicated_support',
    name: 'Dedicated Support',
    description: 'Dedicated account manager and support',
    requiredTier: 'enterprise',
    isEnabled: false,
    upgradePrompt: 'Upgrade to Enterprise for dedicated support',
  },
  {
    id: 'white_label',
    name: 'White Label',
    description: 'White label the platform with your branding',
    requiredTier: 'enterprise',
    isEnabled: false,
    upgradePrompt: 'Upgrade to Enterprise for white label features',
  },
]

// Subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'free',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      'Up to 3 campaigns',
      'Up to 10 ad sets',
      'Up to 50 ads',
      'Basic analytics',
      'Email support',
      '1 team member',
      '1GB storage',
      '1,000 API calls/month',
    ],
    limits: {
      campaigns: 3,
      adSets: 10,
      ads: 50,
      teamMembers: 1,
      storage: '1GB',
      apiCalls: 1000,
    },
    billingCycle: 'monthly',
    description: 'Perfect for getting started with basic advertising needs',
  },
  {
    id: 'pro',
    name: 'Pro',
    tier: 'pro',
    price: {
      monthly: 29,
      yearly: 290,
    },
    features: [
      'Unlimited campaigns',
      'Unlimited ad sets',
      'Unlimited ads',
      'Advanced analytics',
      'Priority support',
      'Up to 10 team members',
      '10GB storage',
      '10,000 API calls/month',
      'Team management',
      'Custom reporting',
    ],
    limits: {
      campaigns: -1, // unlimited
      adSets: -1,
      ads: -1,
      teamMembers: 10,
      storage: '10GB',
      apiCalls: 10000,
    },
    billingCycle: 'monthly',
    isPopular: true,
    description: 'Ideal for growing businesses and marketing teams',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'enterprise',
    price: {
      monthly: 99,
      yearly: 990,
    },
    features: [
      'Everything in Pro',
      'Unlimited team members',
      '100GB storage',
      'Unlimited API calls',
      'Custom integrations',
      'Dedicated support',
      'White label options',
      'SLA guarantee',
      'Custom training',
    ],
    limits: {
      campaigns: -1,
      adSets: -1,
      ads: -1,
      teamMembers: -1,
      storage: '100GB',
      apiCalls: -1,
    },
    billingCycle: 'monthly',
    description: 'For large organizations with advanced needs',
  },
]

// Feature gate configurations
export const FEATURE_GATES = {
  campaigns: {
    free: { limit: 3, upgradePrompt: 'Upgrade to Pro for unlimited campaigns' },
    pro: { limit: -1, upgradePrompt: '' },
    enterprise: { limit: -1, upgradePrompt: '' },
  },
  adSets: {
    free: { limit: 10, upgradePrompt: 'Upgrade to Pro for unlimited ad sets' },
    pro: { limit: -1, upgradePrompt: '' },
    enterprise: { limit: -1, upgradePrompt: '' },
  },
  ads: {
    free: { limit: 50, upgradePrompt: 'Upgrade to Pro for unlimited ads' },
    pro: { limit: -1, upgradePrompt: '' },
    enterprise: { limit: -1, upgradePrompt: '' },
  },
  teamMembers: {
    free: { limit: 1, upgradePrompt: 'Upgrade to Pro for team management' },
    pro: { limit: 10, upgradePrompt: 'Upgrade to Enterprise for unlimited team members' },
    enterprise: { limit: -1, upgradePrompt: '' },
  },
  storage: {
    free: { limit: 1, upgradePrompt: 'Upgrade to Pro for more storage' },
    pro: { limit: 10, upgradePrompt: 'Upgrade to Enterprise for 100GB storage' },
    enterprise: { limit: 100, upgradePrompt: '' },
  },
  apiCalls: {
    free: { limit: 1000, upgradePrompt: 'Upgrade to Pro for more API calls' },
    pro: { limit: 10000, upgradePrompt: 'Upgrade to Enterprise for unlimited API calls' },
    enterprise: { limit: -1, upgradePrompt: '' },
  },
}

// Helper functions
export const getPlanById = (planId: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId)
}

export const getPlanByTier = (tier: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.tier === tier)
}

export const getFeatureById = (featureId: string): Feature | undefined => {
  return FEATURES.find(feature => feature.id === featureId)
}

export const getFeaturesByTier = (tier: string): Feature[] => {
  return FEATURES.filter(feature => {
    const tierOrder = { free: 0, pro: 1, enterprise: 2 }
    const featureTierOrder = tierOrder[feature.requiredTier as keyof typeof tierOrder]
    const currentTierOrder = tierOrder[tier as keyof typeof tierOrder]
    return currentTierOrder >= featureTierOrder
  })
}

export const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number): number => {
  const monthlyTotal = monthlyPrice * 12
  return monthlyTotal - yearlyPrice
}

export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}
