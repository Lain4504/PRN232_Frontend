'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useSubscription } from '@/hooks/use-subscription'
import { useFeatureGate } from '@/hooks/use-feature-gate'
import type { Subscription, FeatureGate } from '@/lib/types/subscription'

interface SubscriptionContextType {
  subscription: Subscription | null
  isLoading: boolean
  error: Error | null
  canAccessFeature: (featureId: string) => Promise<boolean>
  getFeatureGate: (featureId: string) => Promise<FeatureGate | null>
  isSubscriptionActive: boolean
  isSubscriptionExpired: boolean
  isSubscriptionCancelled: boolean
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

interface SubscriptionProviderProps {
  children: ReactNode
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { data: subscription, isLoading, error } = useSubscription()

  const canAccessFeature = async (featureId: string) => {
    if (!subscription) return false
    
    // Import the utility function dynamically to avoid circular dependencies
    const { canAccessFeature: utilCanAccessFeature } = await import('@/lib/utils/subscription')
    return utilCanAccessFeature(subscription, featureId)
  }

  const getFeatureGate = async (featureId: string) => {
    if (!subscription) return null
    
    // Import the utility function dynamically to avoid circular dependencies
    const { getFeatureGate: utilGetFeatureGate } = await import('@/lib/utils/subscription')
    return utilGetFeatureGate(subscription, featureId)
  }

  const isSubscriptionActive = subscription?.status === 'active' || subscription?.status === 'trialing'
  const isSubscriptionExpired = subscription ? new Date(subscription.currentPeriodEnd) < new Date() : false
  const isSubscriptionCancelled = subscription?.status === 'cancelled' || subscription?.cancelAtPeriodEnd || false

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    error,
    canAccessFeature,
    getFeatureGate,
    isSubscriptionActive,
    isSubscriptionExpired,
    isSubscriptionCancelled,
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider')
  }
  return context
}

// Higher-order component for feature gating
export function withSubscriptionProvider<P extends object>(
  Component: React.ComponentType<P>
) {
  return function SubscriptionProviderWrapper(props: P) {
    return (
      <SubscriptionProvider>
        <Component {...props} />
      </SubscriptionProvider>
    )
  }
}
