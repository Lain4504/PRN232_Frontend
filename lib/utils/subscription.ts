import type { 
  Subscription, 
  SubscriptionPlan, 
  SubscriptionTier, 
  FeatureGate,
} from '@/lib/types/subscription'
import { FEATURE_GATES, getPlanByTier } from '@/lib/constants/subscription-plans'

// Subscription validation utilities
export const isSubscriptionActive = (subscription: Subscription): boolean => {
  return subscription.status === 'active' || subscription.status === 'trialing'
}

export const isSubscriptionExpired = (subscription: Subscription): boolean => {
  return new Date(subscription.currentPeriodEnd) < new Date()
}

export const isSubscriptionCancelled = (subscription: Subscription): boolean => {
  return subscription.status === 'cancelled' || subscription.cancelAtPeriodEnd
}

// Feature gating utilities
export const canAccessFeature = (
  subscription: Subscription,
  featureId: string
): boolean => {
  if (!isSubscriptionActive(subscription)) {
    return false
  }

  const featureGate = FEATURE_GATES[featureId as keyof typeof FEATURE_GATES]
  if (!featureGate) {
    return true // Feature not gated
  }

  const tierGate = featureGate[subscription.tier]
  if (!tierGate) {
    return false
  }

  return tierGate.limit === -1 || subscription.usage[featureId as keyof typeof subscription.usage] < tierGate.limit
}

export const getFeatureGate = (
  subscription: Subscription,
  featureId: string
): FeatureGate | null => {
  const featureGate = FEATURE_GATES[featureId as keyof typeof FEATURE_GATES]
  if (!featureGate) {
    return null
  }

  const tierGate = featureGate[subscription.tier]
  if (!tierGate) {
    return null
  }

  const isEnabled = canAccessFeature(subscription, featureId)
  
  return {
    featureId,
    requiredTier: getRequiredTierForFeature(featureId),
    isEnabled,
    upgradePrompt: tierGate.upgradePrompt,
    alternativeAction: isEnabled ? undefined : 'Contact support for assistance',
  }
}

export const getRequiredTierForFeature = (featureId: string): SubscriptionTier => {
  const featureGate = FEATURE_GATES[featureId as keyof typeof FEATURE_GATES]
  if (!featureGate) {
    return 'free'
  }

  // Find the lowest tier that supports this feature
  if (featureGate.enterprise.limit !== undefined) {
    return 'enterprise'
  }
  if (featureGate.pro.limit !== undefined) {
    return 'pro'
  }
  return 'free'
}

// Usage tracking utilities
export const getUsagePercentage = (
  subscription: Subscription,
  featureId: string
): number => {
  const featureGate = FEATURE_GATES[featureId as keyof typeof FEATURE_GATES]
  if (!featureGate) {
    return 0
  }

  const tierGate = featureGate[subscription.tier]
  if (!tierGate || tierGate.limit === -1) {
    return 0 // Unlimited
  }

  const usage = subscription.usage[featureId as keyof typeof subscription.usage] as number
  return Math.min((usage / tierGate.limit) * 100, 100)
}

export const isUsageNearLimit = (
  subscription: Subscription,
  featureId: string,
  threshold: number = 80
): boolean => {
  return getUsagePercentage(subscription, featureId) >= threshold
}

export const getRemainingUsage = (
  subscription: Subscription,
  featureId: string
): number => {
  const featureGate = FEATURE_GATES[featureId as keyof typeof FEATURE_GATES]
  if (!featureGate) {
    return -1 // Unlimited
  }

  const tierGate = featureGate[subscription.tier]
  if (!tierGate || tierGate.limit === -1) {
    return -1 // Unlimited
  }

  const usage = subscription.usage[featureId as keyof typeof subscription.usage] as number
  return Math.max(tierGate.limit - usage, 0)
}

// Plan comparison utilities
export const comparePlans = (currentPlan: SubscriptionPlan, targetPlan: SubscriptionPlan): {
  isUpgrade: boolean
  isDowngrade: boolean
  priceDifference: number
  featureChanges: {
    added: string[]
    removed: string[]
    improved: string[]
  }
} => {
  const tierOrder = { free: 0, pro: 1, enterprise: 2 }
  const currentTierOrder = tierOrder[currentPlan.tier]
  const targetTierOrder = tierOrder[targetPlan.tier]

  const isUpgrade = targetTierOrder > currentTierOrder
  const isDowngrade = targetTierOrder < currentTierOrder

  const priceDifference = targetPlan.price.monthly - currentPlan.price.monthly

  // Compare features
  const currentFeatures = new Set(currentPlan.features)
  const targetFeatures = new Set(targetPlan.features)

  const added = targetPlan.features.filter(feature => !currentFeatures.has(feature))
  const removed = currentPlan.features.filter(feature => !targetFeatures.has(feature))
  const improved = targetPlan.features.filter(feature => 
    currentFeatures.has(feature) && 
    targetPlan.limits[feature as keyof typeof targetPlan.limits] > currentPlan.limits[feature as keyof typeof currentPlan.limits]
  )

  return {
    isUpgrade,
    isDowngrade,
    priceDifference,
    featureChanges: {
      added,
      removed,
      improved,
    },
  }
}

// Billing utilities
export const getNextBillingDate = (subscription: Subscription): Date => {
  return new Date(subscription.currentPeriodEnd)
}

export const getDaysUntilBilling = (subscription: Subscription): number => {
  const nextBilling = getNextBillingDate(subscription)
  const today = new Date()
  const diffTime = nextBilling.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const formatBillingDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// Plan change impact analysis
export const analyzePlanChangeImpact = (
  currentSubscription: Subscription,
  targetPlan: SubscriptionPlan
): {
  willLoseFeatures: boolean
  willLoseData: boolean
  immediateChanges: string[]
  endOfPeriodChanges: string[]
  warnings: string[]
} => {
  const comparison = comparePlans(
    getPlanByTier(currentSubscription.tier)!,
    targetPlan
  )

  const willLoseFeatures = comparison.featureChanges.removed.length > 0
  const willLoseData = comparison.isDowngrade && currentSubscription.usage.campaigns > targetPlan.limits.campaigns

  const immediateChanges: string[] = []
  const endOfPeriodChanges: string[] = []
  const warnings: string[] = []

  if (comparison.isUpgrade) {
    immediateChanges.push('Access to new features will be available immediately')
    immediateChanges.push('Higher usage limits will be applied immediately')
  }

  if (comparison.isDowngrade) {
    endOfPeriodChanges.push('Access to premium features will end at the end of your billing period')
    endOfPeriodChanges.push('Usage limits will be reduced at the end of your billing period')
    
    if (willLoseData) {
      warnings.push('You may need to delete some campaigns to stay within the new plan limits')
    }
  }

  if (comparison.priceDifference !== 0) {
    const changeType = comparison.priceDifference > 0 ? 'increase' : 'decrease'
    immediateChanges.push(`Your monthly billing will ${changeType} by $${Math.abs(comparison.priceDifference)}`)
  }

  return {
    willLoseFeatures,
    willLoseData,
    immediateChanges,
    endOfPeriodChanges,
    warnings,
  }
}

// Subscription status utilities
export const getSubscriptionStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'green'
    case 'trialing':
      return 'blue'
    case 'past_due':
      return 'yellow'
    case 'cancelled':
      return 'red'
    case 'incomplete':
      return 'gray'
    default:
      return 'gray'
  }
}

export const getSubscriptionStatusText = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Active'
    case 'trialing':
      return 'Trial'
    case 'past_due':
      return 'Past Due'
    case 'cancelled':
      return 'Cancelled'
    case 'incomplete':
      return 'Incomplete'
    default:
      return 'Unknown'
  }
}
