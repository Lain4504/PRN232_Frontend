import { useState, useEffect } from 'react'
import { getUserSubscriptions, getActiveSubscription } from '@/lib/api/subscription'
import { SubscriptionResponseDto } from '@/lib/types/subscription'

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

  const refresh = () => {
    loadSubscriptions()
  }

  return {
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