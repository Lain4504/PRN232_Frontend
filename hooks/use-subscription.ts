"use client"

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserSubscriptions, getActiveSubscription, getActiveSubscriptionByProfile, getPlanPricing } from '@/lib/api/subscription'
import { SubscriptionResponseDto, Subscription, SubscriptionPlanEnum, SubscriptionTier } from '@/lib/types/subscription'
import { SUBSCRIPTION_PLANS } from '@/lib/constants/subscription-plans'

export function useSubscription(profileId?: string) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponseDto[]>([])
  const [activeSubscription, setActiveSubscription] = useState<SubscriptionResponseDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSubscriptions()
  }, [profileId])

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // If profileId is provided, get active subscription directly for that profile
      // Backend uses active profile from context, so this will get the subscription
      // for the currently active profile
      if (profileId) {
        try {
          // Get active subscription directly (uses active profile from backend context)
          const active = await getActiveSubscriptionByProfile()
          setActiveSubscription(active)
        } catch (err) {
          console.error('Error fetching active subscription by profile:', err)
          // If API fails (e.g., no active subscription), set to null
          setActiveSubscription(null)
        }

        // Also get all subscriptions for reference
        try {
          const data = await getUserSubscriptions()
          setSubscriptions(data)
        } catch (err) {
          console.error('Error fetching all subscriptions:', err)
          setSubscriptions([])
        }
      } else {
        // No profileId, just get all subscriptions
        const data = await getUserSubscriptions()
        setSubscriptions(data)
      }
    } catch (err) {
      console.error('Subscription loading error:', err)
      // Don't set error - allow fallback to profile-based subscription
      setError(null)
      setActiveSubscription(null)
      setSubscriptions([])
    } finally {
      setIsLoading(false)
    }
  }

  const mapDtoToUi = (dto: SubscriptionResponseDto | null): Subscription | null => {
    if (!dto) return null
    const tierMap: Record<SubscriptionPlanEnum, SubscriptionTier> = {
      [SubscriptionPlanEnum.Free]: 'free',
      [SubscriptionPlanEnum.Basic]: 'basic',
      [SubscriptionPlanEnum.Pro]: 'pro',
    }
    const tier = tierMap[dto.plan]
    const planInfo = getPlanPricing(dto.plan)

    const limits = {
      postsPerMonth: dto.quotaPostsPerMonth,
      aiContentPerDay: dto.quotaAIContentPerDay,
      aiImagesPerDay: dto.quotaAIImagesPerDay,
      platforms: dto.quotaPlatforms,
      accounts: dto.quotaAccounts,
      analysisLevel: dto.analysisLevel,
      adBudgetMonthly: dto.quotaAdBudgetMonthly,
      adCampaigns: dto.quotaAdCampaigns,
    }

    const usage = {
      postsThisMonth: 0,
      aiContentToday: 0,
      aiImagesToday: 0,
      platforms: 0,
      accounts: 0
    }

    const status = dto.isActive ? 'active' : 'cancelled'

    // Calculate end date: if endDate exists, use it; otherwise add 1 month to startDate
    const calculateEndDate = (startDate: string, endDate?: string): string => {
      if (endDate) return endDate

      const start = new Date(startDate)
      const end = new Date(start)
      end.setMonth(end.getMonth() + 1)
      return end.toISOString()
    }

    const ui: Subscription = {
      id: dto.id,
      profileId: dto.profileId,
      plan: dto.plan,
      planName: planInfo.name,
      tier,
      status,
      billingCycle: 'monthly',
      currentPeriodStart: dto.startDate,
      currentPeriodEnd: calculateEndDate(dto.startDate, dto.endDate),
      cancelAtPeriodEnd: false,
      features: [],
      limits,
      usage,
      payOSOrderCode: dto.payOSOrderCode,
      payOSPaymentLinkId: dto.payOSPaymentLinkId,
    }
    return ui
  }

  const refresh = () => {
    loadSubscriptions()
  }

  return {
    // Back-compat for components expecting `data` to be the current subscription
    data: mapDtoToUi(activeSubscription),
    subscriptions,
    activeSubscription,
    isLoading,
    error,
    refresh
  }
}

export function useActiveSubscription(profileId: string) {
  const [subscription, setSubscription] = useState<SubscriptionResponseDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profileId) return

    loadActiveSubscription()
  }, [profileId])

  const loadActiveSubscription = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getActiveSubscription(profileId)
      setSubscription(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = () => {
    loadActiveSubscription()
  }

  return {
    subscription,
    isLoading,
    error,
    refresh
  }
}

export function useChangePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ planId, billingCycle, immediate }: {
      planId: string
      billingCycle: 'monthly' | 'yearly'
      immediate: boolean
    }) => {
      const { changeSubscriptionPlan } = await import('@/lib/api/subscription')
      return await changeSubscriptionPlan(planId, billingCycle, immediate)
    },
    onSuccess: () => {
      // Invalidate subscription queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    }
  })
}

export function usePlanComparison(targetPlanId: string) {
  return useQuery({
    queryKey: ['plan-comparison', targetPlanId],
    queryFn: async () => {
      // Mock plan comparison logic
      await new Promise(resolve => setTimeout(resolve, 500))

      // In a real implementation, this would analyze the plan differences
      return {
        isUpgrade: true,
        isDowngrade: false,
        priceDifference: 20,
        featureChanges: {
          added: ['Advanced analytics', 'Priority support'],
          removed: [],
          modified: []
        }
      }
    },
    enabled: !!targetPlanId
  })
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      // Use the actual plans defined in constants
      return SUBSCRIPTION_PLANS
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  })
}

export function useCancelSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ subscriptionId, reason }: {
      subscriptionId: string
      reason?: string
    }) => {
      const { cancelSubscription } = await import('@/lib/api/subscription')
      return await cancelSubscription(subscriptionId)
    },
    onSuccess: () => {
      // Invalidate subscription queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    }
  })
}
