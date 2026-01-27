import { z } from 'zod'

// Subscription plan enum matching backend
export enum SubscriptionPlanEnum {
  Free = 0,
  Basic = 1,
  Pro = 2
}

export enum PaymentStatusEnum {
  Pending = 0,
  Success = 1,
  Failed = 2,
  Refunded = 3
}

// Subscription plan types
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise'
export type BillingCycle = 'monthly' | 'yearly'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing' | 'incomplete'

// Feature definitions
export interface Feature {
  id: string
  name: string
  description: string
  requiredTier: SubscriptionTier
  isEnabled: boolean
  upgradePrompt?: string
}

// Subscription plan interface
export interface SubscriptionPlan {
  id: string
  name: string
  tier: SubscriptionTier
  price: {
    monthly: number
    yearly: number
  }
  features: string[]
  limits: {
    postsPerMonth: number
    aiContentPerDay: number
    aiImagesPerDay: number
    platforms: number
    accounts: number
    analysisLevel: number
    adBudgetMonthly: number
    adCampaigns: number
  }
  billingCycle: BillingCycle
  isPopular?: boolean
  description: string
}

// Backend DTO types matching API
export interface SubscriptionResponseDto {
  id: string
  profileId: string
  plan: SubscriptionPlanEnum
  quotaPostsPerMonth: number
  quotaAIContentPerDay: number
  quotaAIImagesPerDay: number
  quotaPlatforms: number
  quotaAccounts: number
  analysisLevel: number
  quotaAdBudgetMonthly: number
  quotaAdCampaigns: number
  startDate: string
  endDate?: string
  isActive: boolean
  createdAt: string
  payOSOrderCode?: string
  payOSPaymentLinkId?: string
}

export interface PayOSCheckoutResponse {
  checkoutUrl: string
  paymentLinkId: string
  orderCode: number
  amount: number
  status: string
}

// Create subscription request
export interface CreateSubscriptionRequest {
  profileId: string
  plan: SubscriptionPlanEnum
  isRecurring: boolean
}

// Payment intent request
export interface CreatePaymentIntentRequest {
  amount: number
  currency: string
  subscriptionPlanId: number
  description?: string
}

// Payment intent response
export interface CreatePaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
  status: string
}

// Payment response
export interface PaymentResponseDto {
  id: string
  userId: string
  userEmail?: string
  subscriptionId?: string
  amount: number
  currency: string
  status: string | number
  transactionId?: string
  paymentMethod?: string
  invoiceUrl?: string
  createdAt: string
}

// Current subscription interface (for UI)
export interface Subscription {
  id: string
  profileId: string
  plan: SubscriptionPlanEnum
  planName: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  billingCycle: BillingCycle
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  features: string[]
  limits: SubscriptionPlan['limits']
  usage: {
    postsThisMonth: number
    aiContentToday: number
    aiImagesToday: number
    platforms: number
    accounts: number
  }
  payOSOrderCode?: string
  payOSPaymentLinkId?: string
}

// Billing information interface
export interface BillingInfo {
  id: string
  subscriptionId: string
  nextBillingDate: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  invoiceUrl?: string
  paymentMethod: {
    type: 'card' | 'bank_account'
    last4: string
    brand?: string
  }
}

// Billing history interface
export interface BillingHistory {
  id: string
  subscriptionId: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  date: string
  description: string
  invoiceUrl?: string
}

// Plan change request interface
export interface PlanChangeRequest {
  planId: string
  billingCycle: BillingCycle
  immediate?: boolean
}

// Feature gate interface
export interface FeatureGate {
  featureId: string
  requiredTier: SubscriptionTier
  isEnabled: boolean
  upgradePrompt: string
  alternativeAction?: string
}

// Validation schemas
export const planChangeSchema = z.object({
  planId: z.string().min(1, 'Plan selection is required'),
  billingCycle: z.enum(['monthly', 'yearly']),
  immediate: z.boolean().optional(),
})

export const subscriptionValidationSchema = z.object({
  planId: z.string().min(1, 'Plan selection is required'),
  billingCycle: z.enum(['monthly', 'yearly']),
})

// Type exports
export type PlanChangeFormData = z.infer<typeof planChangeSchema>
export type SubscriptionValidationFormData = z.infer<typeof subscriptionValidationSchema>

// API response types
export interface SubscriptionApiResponse {
  success: boolean
  data?: Subscription
  error?: string
}

export interface PlansApiResponse {
  success: boolean
  data?: SubscriptionPlan[]
  error?: string
}

export interface BillingApiResponse {
  success: boolean
  data?: BillingInfo
  error?: string
}

export interface BillingHistoryApiResponse {
  success: boolean
  data?: BillingHistory[]
  error?: string
}

// Error types
export interface SubscriptionError {
  message: string
  code?: string
  field?: string
  retryable?: boolean
}
