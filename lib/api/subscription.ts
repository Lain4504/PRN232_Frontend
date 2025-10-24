import { api } from '../api'
import type { 
  SubscriptionResponseDto, 
  CreateSubscriptionRequest, 
  CreatePaymentIntentRequest, 
  CreatePaymentIntentResponse,
  PaymentResponseDto 
} from '@/lib/types/subscription'

// Payment Method API - This should be called from within Stripe Elements context
export const createPaymentMethod = async (stripe: any, cardElement: any, billingDetails: any) => {
  if (!stripe) {
    throw new Error('Stripe not initialized')
  }

  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
    billing_details: billingDetails,
  })

  if (error) {
    throw new Error(error.message || 'Failed to create payment method')
  }

  return paymentMethod
}

// Payment Intent API (kept for backward compatibility)
export const createPaymentIntent = async (
  profileId: string, 
  planId: number, 
  amount: number
): Promise<CreatePaymentIntentResponse> => {
  const request: CreatePaymentIntentRequest = {
    amount,
    currency: 'USD',
    subscriptionPlanId: planId,
    description: `Subscription payment for plan ${planId}`
  }
  
  const response = await api.post<CreatePaymentIntentResponse>('/payment/create-payment-intent', request)
  return response.data!
}

export const confirmPayment = async (paymentIntentId: string): Promise<PaymentResponseDto> => {
  const response = await api.post<PaymentResponseDto>(`/payment/confirm/${paymentIntentId}`)
  return response.data!
}

// Subscription API
export const createSubscription = async (request: CreateSubscriptionRequest): Promise<SubscriptionResponseDto> => {
  const response = await api.post<SubscriptionResponseDto>('/payment/subscription', request)
  return response.data!
}

export const getSubscription = async (id: string): Promise<SubscriptionResponseDto> => {
  const response = await api.get<SubscriptionResponseDto>(`/payment/subscription/${id}`)
  return response.data!
}

export const getUserSubscriptions = async (): Promise<SubscriptionResponseDto[]> => {
  const response = await api.get<SubscriptionResponseDto[]>('/payment/subscriptions')
  return response.data!
}

export const cancelSubscription = async (id: string): Promise<boolean> => {
  const response = await api.delete<boolean>(`/payment/subscription/${id}`)
  return response.data!
}

// Helper functions
export const getActiveSubscription = async (profileId: string): Promise<SubscriptionResponseDto | null> => {
  try {
    const subscriptions = await getUserSubscriptions()
    return subscriptions.find(sub => sub.profileId === profileId && sub.isActive) || null
  } catch (error) {
    console.error('Error fetching active subscription:', error)
    return null
  }
}

export const getPlanPricing = (plan: number) => {
  const pricing = {
    0: { price: 0, period: 'forever', name: 'Free' },
    1: { price: 29, period: 'month', name: 'Basic' },
    2: { price: 99, period: 'month', name: 'Pro' }
  }
  return pricing[plan as keyof typeof pricing] || pricing[0]
}

export const getPlanFeatures = (plan: number) => {
  const features = {
    0: {
      posts: 100,
      storage: 5,
      campaigns: 5,
      teamMembers: 1,
      features: ['Basic content creation', 'Facebook posting', 'Basic analytics']
    },
    1: {
      posts: 300,
      storage: 25,
      campaigns: 15,
      teamMembers: 5,
      features: ['All Free features', 'AI content generation', 'Advanced analytics', 'Team collaboration']
    },
    2: {
      posts: -1, // unlimited
      storage: 100,
      campaigns: -1, // unlimited
      teamMembers: 20,
      features: ['All Basic features', 'Unlimited posts', 'Priority support', 'Advanced reporting', 'API access']
    }
  }
  return features[plan as keyof typeof features] || features[0]
}
