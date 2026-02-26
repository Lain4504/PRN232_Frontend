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
export const comparePlans = (currentPlan: SubscriptionPlan | undefined | null, targetPlan: SubscriptionPlan): {
  isUpgrade: boolean
  isDowngrade: boolean
  priceDifference: number
  featureChanges: {
    added: string[]
    removed: string[]
    improved: string[]
  }
} => {
  // Handle case where currentPlan is undefined (e.g., no subscription or invalid tier)
  if (!currentPlan) {
    // Default to free plan for comparison
    const freePlan = getPlanByTier('free')
    if (!freePlan) {
      // Fallback: return neutral comparison if we can't get free plan
      return {
        isUpgrade: true,
        isDowngrade: false,
        priceDifference: targetPlan.price.monthly,
        featureChanges: {
          added: targetPlan.features,
          removed: [],
          improved: [],
        },
      }
    }
    currentPlan = freePlan
  }

  const tierOrder = { free: 0, basic: 1, pro: 2, enterprise: 3 }
  const currentTierOrder = tierOrder[currentPlan.tier as keyof typeof tierOrder] ?? 0
  const targetTierOrder = tierOrder[targetPlan.tier as keyof typeof tierOrder] ?? 0

  const isUpgrade = targetTierOrder > currentTierOrder
  const isDowngrade = targetTierOrder < currentTierOrder

  const priceDifference = targetPlan.price.monthly - currentPlan.price.monthly

  // Compare features
  const currentFeatures = new Set(currentPlan.features)
  const targetFeatures = new Set(targetPlan.features)

  const added = targetPlan.features.filter(feature => !currentFeatures.has(feature))
  const removed = currentPlan.features.filter(feature => !targetFeatures.has(feature))
  const improved = targetPlan.features.filter(feature =>
    currentFeatures.has(feature)
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
  // Get current plan, fallback to free if not found
  const currentPlan = getPlanByTier(currentSubscription.tier) ?? getPlanByTier('free')

  if (!currentPlan) {
    // If we can't get any plan, return safe defaults
    return {
      willLoseFeatures: false,
      willLoseData: false,
      immediateChanges: ['Unable to determine plan changes. Please contact support.'],
      endOfPeriodChanges: [],
      warnings: ['Current subscription tier could not be determined.'],
    }
  }

  const comparison = comparePlans(currentPlan, targetPlan)

  const willLoseFeatures = comparison.featureChanges.removed.length > 0
  const willLoseData = comparison.isDowngrade && (
    (targetPlan.limits.postsPerMonth !== -1 && currentSubscription.usage.postsThisMonth > targetPlan.limits.postsPerMonth) ||
    (targetPlan.limits.platforms !== -1 && currentSubscription.usage.platforms > targetPlan.limits.platforms) ||
    (targetPlan.limits.accounts !== -1 && currentSubscription.usage.accounts > targetPlan.limits.accounts)
  )

  const immediateChanges: string[] = []
  const endOfPeriodChanges: string[] = []
  const warnings: string[] = []

  if (comparison.isUpgrade) {
    immediateChanges.push('Bạn sẽ có quyền truy cập các tính năng mới ngay lập tức')
    immediateChanges.push('Hạn mức sử dụng mới sẽ được áp dụng ngay sau khi thanh toán')
  }

  if (comparison.isDowngrade) {
    endOfPeriodChanges.push('Quyền truy cập các tính năng nâng cao sẽ kết thúc vào cuối chu kỳ thanh toán này')
    endOfPeriodChanges.push('Hạn mức sử dụng sẽ bị cắt giảm sau khi gói hiện tại hết hạn')

    if (willLoseData) {
      warnings.push('Bạn có thể cần xóa bớt dữ liệu (thương hiệu, tài khoản) để phù hợp với hạn mức gói thấp hơn')
    }
  }

  if (comparison.priceDifference !== 0) {
    const changeType = comparison.priceDifference > 0 ? 'tăng thêm' : 'giảm đi'
    const formattedDiff = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(comparison.priceDifference))
    immediateChanges.push(`Chi phí thanh toán của bạn sẽ ${changeType} là ${formattedDiff}`)
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
      return 'Đang hoạt động'
    case 'trialing':
      return 'Dùng thử'
    case 'past_due':
      return 'Quá hạn'
    case 'cancelled':
      return 'Đã hủy'
    case 'incomplete':
      return 'Chưa hoàn tất'
    default:
      return 'Không xác định'
  }
}
