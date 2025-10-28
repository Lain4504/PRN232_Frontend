"use client"

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserSubscriptions, getActiveSubscription, getPlanPricing } from '@/lib/api/subscription'
import { SubscriptionResponseDto, Subscription, SubscriptionPlanEnum, SubscriptionTier } from '@/lib/types/subscription'

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
      
      const data = await getUserSubscriptions()
      setSubscriptions(data)
      
      if (profileId) {
        const active = await getActiveSubscription(profileId)
        setActiveSubscription(active)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions')
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

    const limits = (() => {
      switch (dto.plan) {
        case SubscriptionPlanEnum.Free:
          return { campaigns: 3, adSets: 10, ads: 50, teamMembers: 1, storage: '1', apiCalls: 1000 }
        case SubscriptionPlanEnum.Basic:
          return { campaigns: 15, adSets: 50, ads: 200, teamMembers: 5, storage: '25', apiCalls: 5000 }
        case SubscriptionPlanEnum.Pro:
        default:
          return { campaigns: -1, adSets: -1, ads: -1, teamMembers: 20, storage: '100', apiCalls: -1 }
      }
    })()

    const usage = { campaigns: 0, adSets: 0, ads: 0, teamMembers: 0, storage: 0, apiCalls: 0 }

    const status = dto.isActive ? 'active' : 'cancelled'

    const ui: Subscription = {
      id: dto.id,
      profileId: dto.profileId,
      plan: dto.plan,
      planName: planInfo.name,
      tier,
      status,
      billingCycle: 'monthly',
      currentPeriodStart: dto.startDate,
      currentPeriodEnd: dto.endDate ?? dto.startDate,
      cancelAtPeriodEnd: false,
      features: [],
      limits,
      usage,
      stripeSubscriptionId: dto.stripeSubscriptionId,
      stripeCustomerId: dto.stripeCustomerId,
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
      // Mock API call for plan change
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, this would call your API
      const response = await fetch('/api/subscription/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billingCycle, immediate })
      })
      
      if (!response.ok) {
        throw new Error('Failed to change plan')
      }
      
      return response.json()
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
      // Mock subscription plans data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // In a real implementation, this would fetch from your API
      return [
        {
          id: 'free',
          name: 'Free',
          tier: 'free' as const,
          price: { monthly: 0, yearly: 0 },
          description: 'Perfect for getting started',
          billingCycle: 'monthly' as const,
          features: [
            'Up to 3 campaigns',
            'Basic analytics',
            'Email support',
            '1 team member'
          ],
          limits: {
            campaigns: 3,
            adSets: 10,
            ads: 50,
            teamMembers: 1,
            storage: '1GB',
            apiCalls: 1000
          },
          isPopular: false
        },
        {
          id: 'basic',
          name: 'Basic',
          tier: 'basic' as const,
          price: { monthly: 29, yearly: 290 },
          description: 'Great for small teams',
          billingCycle: 'monthly' as const,
          features: [
            'Up to 15 campaigns',
            'Advanced analytics',
            'Priority support',
            '5 team members',
            'AI content generation'
          ],
          limits: {
            campaigns: 15,
            adSets: 50,
            ads: 200,
            teamMembers: 5,
            storage: '25GB',
            apiCalls: 5000
          },
          isPopular: true
        },
        {
          id: 'pro',
          name: 'Pro',
          tier: 'pro' as const,
          price: { monthly: 99, yearly: 990 },
          description: 'For growing businesses',
          billingCycle: 'monthly' as const,
          features: [
            'Unlimited campaigns',
            'Advanced reporting',
            '24/7 support',
            '20 team members',
            'API access',
            'Custom integrations'
          ],
          limits: {
            campaigns: -1,
            adSets: -1,
            ads: -1,
            teamMembers: 20,
            storage: '100GB',
            apiCalls: -1
          },
          isPopular: false
        }
      ]
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
      // Mock API call for subscription cancellation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, this would call your API
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, reason })
      })
      
      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Invalidate subscription queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    }
  })
}