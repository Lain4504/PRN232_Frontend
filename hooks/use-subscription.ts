import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { 
  Subscription, 
  SubscriptionPlan, 
  PlanChangeRequest,
  SubscriptionApiResponse,
  PlansApiResponse 
} from '@/lib/types/subscription'
import { api } from '@/lib/api'

// Query keys
const SUBSCRIPTION_KEYS = {
  current: ['subscription', 'current'] as const,
  plans: ['subscription', 'plans'] as const,
  billing: ['subscription', 'billing'] as const,
  history: ['subscription', 'history'] as const,
}

// Mock API functions (replace with real API calls)
const mockApi = {
  getCurrentSubscription: async (): Promise<Subscription> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: 'sub_123',
      userId: 'user_123',
      planId: 'free',
      planName: 'Free',
      tier: 'free',
      status: 'active',
      billingCycle: 'monthly',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      features: ['campaigns', 'basic_analytics'],
      limits: {
        campaigns: 3,
        adSets: 10,
        ads: 50,
        teamMembers: 1,
        storage: '1GB',
        apiCalls: 1000,
      },
      usage: {
        campaigns: 2,
        adSets: 5,
        ads: 15,
        teamMembers: 1,
        storage: 0.5,
        apiCalls: 250,
      },
    }
  },

  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        id: 'free',
        name: 'Free',
        tier: 'free',
        price: { monthly: 0, yearly: 0 },
        features: ['Up to 3 campaigns', 'Basic analytics', 'Email support'],
        limits: {
          campaigns: 3,
          adSets: 10,
          ads: 50,
          teamMembers: 1,
          storage: '1GB',
          apiCalls: 1000,
        },
        billingCycle: 'monthly',
        description: 'Perfect for getting started',
      },
      {
        id: 'pro',
        name: 'Pro',
        tier: 'pro',
        price: { monthly: 29, yearly: 290 },
        features: ['Unlimited campaigns', 'Advanced analytics', 'Priority support'],
        limits: {
          campaigns: -1,
          adSets: -1,
          ads: -1,
          teamMembers: 10,
          storage: '10GB',
          apiCalls: 10000,
        },
        billingCycle: 'monthly',
        isPopular: true,
        description: 'Ideal for growing businesses',
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        tier: 'enterprise',
        price: { monthly: 99, yearly: 990 },
        features: ['Everything in Pro', 'Custom integrations', 'Dedicated support'],
        limits: {
          campaigns: -1,
          adSets: -1,
          ads: -1,
          teamMembers: -1,
          storage: '100GB',
          apiCalls: -1,
        },
        billingCycle: 'monthly',
        description: 'For large organizations',
      },
    ]
  },

  changePlan: async (request: PlanChangeRequest): Promise<SubscriptionApiResponse> => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate success
    return {
      success: true,
      data: {
        id: 'sub_123',
        userId: 'user_123',
        planId: request.planId,
        planName: request.planId === 'pro' ? 'Pro' : 'Enterprise',
        tier: request.planId === 'pro' ? 'pro' : 'enterprise',
        status: 'active',
        billingCycle: request.billingCycle,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        features: ['campaigns', 'advanced_analytics', 'priority_support'],
        limits: {
          campaigns: -1,
          adSets: -1,
          ads: -1,
          teamMembers: 10,
          storage: '10GB',
          apiCalls: 10000,
        },
        usage: {
          campaigns: 2,
          adSets: 5,
          ads: 15,
          teamMembers: 1,
          storage: 0.5,
          apiCalls: 250,
        },
      },
    }
  },

  cancelSubscription: async (): Promise<SubscriptionApiResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    return {
      success: true,
      data: {
        id: 'sub_123',
        userId: 'user_123',
        planId: 'free',
        planName: 'Free',
        tier: 'free',
        status: 'cancelled',
        billingCycle: 'monthly',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: true,
        features: ['campaigns', 'basic_analytics'],
        limits: {
          campaigns: 3,
          adSets: 10,
          ads: 50,
          teamMembers: 1,
          storage: '1GB',
          apiCalls: 1000,
        },
        usage: {
          campaigns: 2,
          adSets: 5,
          ads: 15,
          teamMembers: 1,
          storage: 0.5,
          apiCalls: 250,
        },
      },
    }
  },
}

// Hooks
export const useSubscription = () => {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.current,
    queryFn: mockApi.getCurrentSubscription,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: SUBSCRIPTION_KEYS.plans,
    queryFn: mockApi.getSubscriptionPlans,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  })
}

export const useChangePlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mockApi.changePlan,
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.setQueryData(SUBSCRIPTION_KEYS.current, response.data)
        toast.success('Plan changed successfully!')
      } else {
        toast.error(response.error || 'Failed to change plan')
      }
    },
    onError: (error) => {
      console.error('Plan change error:', error)
      toast.error('Failed to change plan. Please try again.')
    },
  })
}

export const useCancelSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mockApi.cancelSubscription,
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.setQueryData(SUBSCRIPTION_KEYS.current, response.data)
        toast.success('Subscription cancelled successfully')
      } else {
        toast.error(response.error || 'Failed to cancel subscription')
      }
    },
    onError: (error) => {
      console.error('Subscription cancellation error:', error)
      toast.error('Failed to cancel subscription. Please try again.')
    },
  })
}

// Utility hooks
export const useSubscriptionStatus = () => {
  const { data: subscription, isLoading, error } = useSubscription()
  
  return {
    subscription,
    isLoading,
    error,
    isActive: subscription?.status === 'active',
    isTrialing: subscription?.status === 'trialing',
    isCancelled: subscription?.status === 'cancelled' || subscription?.cancelAtPeriodEnd,
    isExpired: subscription ? new Date(subscription.currentPeriodEnd) < new Date() : false,
  }
}

export const usePlanComparison = (targetPlanId: string) => {
  const { data: subscription } = useSubscription()
  const { data: plans } = useSubscriptionPlans()
  
  if (!subscription || !plans) {
    return null
  }

  const currentPlan = plans.find(plan => plan.id === subscription.planId)
  const targetPlan = plans.find(plan => plan.id === targetPlanId)
  
  if (!currentPlan || !targetPlan) {
    return null
  }

  const tierOrder = { free: 0, pro: 1, enterprise: 2 }
  const currentTierOrder = tierOrder[currentPlan.tier]
  const targetTierOrder = tierOrder[targetPlan.tier]

  return {
    currentPlan,
    targetPlan,
    isUpgrade: targetTierOrder > currentTierOrder,
    isDowngrade: targetTierOrder < currentTierOrder,
    priceDifference: targetPlan.price.monthly - currentPlan.price.monthly,
  }
}
