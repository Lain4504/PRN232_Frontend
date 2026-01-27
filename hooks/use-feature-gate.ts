import { useMemo } from 'react'
import { useSubscription } from './use-subscription'
import { useProfile } from '@/lib/contexts/profile-context'
import { checkFeatureAccess, ProfileTypeEnum } from '@/lib/utils/profile-utils'
import type { FeatureGate } from '@/lib/types/subscription'
import {
  canAccessFeature,
  getFeatureGate,
  getUsagePercentage,
  isUsageNearLimit,
  getRemainingUsage
} from '@/lib/utils/subscription'

export const useFeatureGate = (featureId: string) => {
  const { activeProfileId, profileType } = useProfile()
  const { data: subscription, isLoading, error } = useSubscription(activeProfileId || undefined)

  const featureGate = useMemo((): FeatureGate | null => {
    if (!subscription || isLoading || error) {
      return null
    }

    return getFeatureGate(subscription, featureId)
  }, [subscription, featureId, isLoading, error])

  const canAccess = useMemo(() => {
    // First check profile-based access
    if (!checkFeatureAccess(profileType, featureId)) {
      return false
    }

    // Then check subscription-based access if available
    // Fallback to profile gate while subscription is loading or unavailable
    if (!subscription || isLoading || error) {
      return true
    }

    return canAccessFeature(subscription, featureId)
  }, [profileType, subscription, featureId, isLoading, error])

  const usagePercentage = useMemo(() => {
    if (!subscription || isLoading || error) {
      return 0
    }

    return getUsagePercentage(subscription, featureId)
  }, [subscription, featureId, isLoading, error])

  const isNearLimit = useMemo(() => {
    if (!subscription || isLoading || error) {
      return false
    }

    return isUsageNearLimit(subscription, featureId)
  }, [subscription, featureId, isLoading, error])

  const remainingUsage = useMemo(() => {
    if (!subscription || isLoading || error) {
      return -1
    }

    return getRemainingUsage(subscription, featureId)
  }, [subscription, featureId, isLoading, error])

  return {
    featureGate,
    canAccess,
    usagePercentage,
    isNearLimit,
    remainingUsage,
    isLoading,
    error,
  }
}

export const useFeatureGates = (featureIds: string[]) => {
  const { data: subscription, isLoading, error } = useSubscription()

  const featureGates = useMemo(() => {
    if (!subscription || isLoading || error) {
      return {}
    }

    return featureIds.reduce((acc, featureId) => {
      acc[featureId] = getFeatureGate(subscription, featureId)
      return acc
    }, {} as Record<string, FeatureGate | null>)
  }, [subscription, featureIds, isLoading, error])

  const canAccessFeatures = useMemo(() => {
    if (!subscription || isLoading || error) {
      return {}
    }

    return featureIds.reduce((acc, featureId) => {
      acc[featureId] = canAccessFeature(subscription, featureId)
      return acc
    }, {} as Record<string, boolean>)
  }, [subscription, featureIds, isLoading, error])

  const usagePercentages = useMemo(() => {
    if (!subscription || isLoading || error) {
      return {}
    }

    return featureIds.reduce((acc, featureId) => {
      acc[featureId] = getUsagePercentage(subscription, featureId)
      return acc
    }, {} as Record<string, number>)
  }, [subscription, featureIds, isLoading, error])

  const isNearLimits = useMemo(() => {
    if (!subscription || isLoading || error) {
      return {}
    }

    return featureIds.reduce((acc, featureId) => {
      acc[featureId] = isUsageNearLimit(subscription, featureId)
      return acc
    }, {} as Record<string, boolean>)
  }, [subscription, featureIds, isLoading, error])

  const remainingUsages = useMemo(() => {
    if (!subscription || isLoading || error) {
      return {}
    }

    return featureIds.reduce((acc, featureId) => {
      acc[featureId] = getRemainingUsage(subscription, featureId)
      return acc
    }, {} as Record<string, number>)
  }, [subscription, featureIds, isLoading, error])

  return {
    featureGates,
    canAccessFeatures,
    usagePercentages,
    isNearLimits,
    remainingUsages,
    isLoading,
    error,
  }
}

// Hook for checking if user can perform a specific action
export const useCanPerformAction = (action: string) => {
  const { data: subscription, isLoading, error } = useSubscription()

  const canPerform = useMemo(() => {
    if (!subscription || isLoading || error) {
      return false
    }

    // Map actions to features
    const actionToFeatureMap: Record<string, string> = {
      'create_post': 'postsPerMonth',
      'generate_content': 'aiContentPerDay',
      'generate_image': 'aiImagesPerDay',
      'connect_platform': 'platforms',
      'link_account': 'accounts',
      'create_campaign': 'adCampaigns',
    }

    const featureId = actionToFeatureMap[action]
    if (!featureId) {
      return true // Action not gated
    }

    return canAccessFeature(subscription, featureId)
  }, [subscription, action, isLoading, error])

  const upgradePrompt = useMemo(() => {
    if (!subscription || isLoading || error || canPerform) {
      return null
    }

    const actionToFeatureMap: Record<string, string> = {
      'create_post': 'postsPerMonth',
      'generate_content': 'aiContentPerDay',
      'generate_image': 'aiImagesPerDay',
      'connect_platform': 'platforms',
      'link_account': 'accounts',
      'create_campaign': 'adCampaigns',
    }

    const featureId = actionToFeatureMap[action]
    if (!featureId) {
      return null
    }

    const featureGate = getFeatureGate(subscription, featureId)
    return featureGate?.upgradePrompt || null
  }, [subscription, action, isLoading, error, canPerform])

  return {
    canPerform,
    upgradePrompt,
    isLoading,
    error,
  }
}

// Hook for getting subscription limits
export const useSubscriptionLimits = () => {
  const { data: subscription, isLoading, error } = useSubscription()

  const limits = useMemo(() => {
    if (!subscription || isLoading || error) {
      return null
    }

    return subscription.limits
  }, [subscription, isLoading, error])

  const usage = useMemo(() => {
    if (!subscription || isLoading || error) {
      return null
    }

    return subscription.usage
  }, [subscription, isLoading, error])

  const isAtLimit = useMemo(() => {
    if (!subscription || isLoading || error) {
      return {}
    }

    return {
      posts: subscription.usage.postsThisMonth >= subscription.limits.postsPerMonth && subscription.limits.postsPerMonth !== -1,
      aiContent: subscription.usage.aiContentToday >= subscription.limits.aiContentPerDay && subscription.limits.aiContentPerDay !== -1,
      aiImages: subscription.usage.aiImagesToday >= subscription.limits.aiImagesPerDay && subscription.limits.aiImagesPerDay !== -1,
      platforms: subscription.usage.platforms >= subscription.limits.platforms && subscription.limits.platforms !== -1,
      accounts: subscription.usage.accounts >= subscription.limits.accounts && subscription.limits.accounts !== -1,
    }
  }, [subscription, isLoading, error])

  return {
    limits,
    usage,
    isAtLimit,
    isLoading,
    error,
  }
}
