import { api } from '../api'
import type {
  SubscriptionResponseDto,
  CreateSubscriptionRequest,
  CreatePaymentIntentRequest,
  PayOSCheckoutResponse,
  PaymentResponseDto
} from '@/lib/types/subscription'

// PayOS Checkout API
export const createPayOSCheckoutLink = async (
  planId: number,
): Promise<PayOSCheckoutResponse> => {
  const request: CreatePaymentIntentRequest = {
    amount: 0, // Backend will calculate based on plan
    currency: 'VND',
    subscriptionPlanId: planId,
    description: `Subscription payment for plan ${planId}`
  }

  const response = await api.post<PayOSCheckoutResponse>('/payment/create-checkout-link', request)
  return response.data!
}

export const confirmPayOSPayment = async (orderCode: number): Promise<PaymentResponseDto> => {
  const response = await api.post<PaymentResponseDto>(`/payment/confirm/${orderCode}`)
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

export const getActiveSubscriptionByProfile = async (): Promise<SubscriptionResponseDto | null> => {
  try {
    const response = await api.get<SubscriptionResponseDto>('/payment/subscription/active')
    return response.data || null
  } catch (error) {
    console.error('Error fetching active subscription by profile:', error)
    return null
  }
}

export const cancelSubscription = async (id: string): Promise<boolean> => {
  const response = await api.delete<boolean>(`/payment/subscription/${id}`)
  return response.data!
}

export const changeSubscriptionPlan = async (
  planId: string,
  billingCycle: 'monthly' | 'yearly',
  immediate: boolean
): Promise<SubscriptionResponseDto> => {
  // Map plan ID string to enum value
  const planMap: Record<string, number> = {
    'free': 0,
    'plus': 1,
    'premium': 2
  }

  const planEnum = planMap[planId] ?? 0

  const response = await api.put<SubscriptionResponseDto>('/payment/subscription/change-plan', {
    planId: planEnum,
    billingCycle,
    immediate
  })
  return response.data!
}

// Payment History API
export const getUserPaymentHistory = async (): Promise<PaymentResponseDto[]> => {
  const response = await api.get<PaymentResponseDto[]>('/payment/history')
  return response.data!
}

// Helper functions
export const getActiveSubscription = async (profileId: string): Promise<SubscriptionResponseDto | null> => {
  try {
    // Try to get active subscription directly by profile
    const active = await getActiveSubscriptionByProfile()
    if (active && active.profileId === profileId) {
      return active
    }

    // Fallback: get all subscriptions and filter
    const subscriptions = await getUserSubscriptions()
    return subscriptions.find(sub => sub.profileId === profileId && sub.isActive) || null
  } catch (error) {
    console.error('Error fetching active subscription:', error)
    return null
  }
}

export const getPlanPricing = (plan: number) => {
  const pricing = {
    0: { price: 0, period: 'vĩnh viễn', name: 'Free' },
    1: { price: 359000, period: 'tháng', name: 'Plus' },
    2: { price: 559000, period: 'tháng', name: 'Premium' }
  }
  return pricing[plan as keyof typeof pricing] || pricing[0]
}

export const getPlanFeatures = (plan: number) => {
  const features = {
    0: {
      posts: 5,
      platforms: 1,
      accounts: 1,
      features: ['Lên lịch đăng tự động', 'Phân tích độ tuổi, giới tính']
    },
    1: {
      posts: 30,
      platforms: 2,
      accounts: 3,
      features: ['AI content (2 bài/ngày)', 'AI image (7 hình/ngày)', 'Phân tích hiệu quả quảng cáo']
    },
    2: {
      posts: -1, // unlimited
      platforms: 3,
      accounts: 5,
      features: ['AI content (4 bài/ngày)', 'AI image (10 hình/ngày)', 'Đề xuất ngân sách & nội dung']
    }
  }
  return features[plan as keyof typeof features] || features[0]
}
