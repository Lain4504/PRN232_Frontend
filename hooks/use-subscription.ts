"use client"

import { useState, useEffect } from 'react'
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