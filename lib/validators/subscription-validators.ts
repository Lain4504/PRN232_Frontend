import { z } from 'zod'
import type { SubscriptionTier, BillingCycle } from '@/lib/types/subscription'

// Basic subscription validation schemas
export const subscriptionTierSchema = z.enum(['free', 'pro', 'enterprise'])
export const billingCycleSchema = z.enum(['monthly', 'yearly'])
export const subscriptionStatusSchema = z.enum(['active', 'cancelled', 'past_due', 'trialing', 'incomplete'])

// Plan change validation
export const planChangeRequestSchema = z.object({
  planId: z.string().min(1, 'Plan selection is required'),
  billingCycle: billingCycleSchema,
  immediate: z.boolean().optional(),
  reason: z.string().optional()
})

// Subscription limits validation
export const subscriptionLimitsSchema = z.object({
  campaigns: z.number().int().min(0),
  adSets: z.number().int().min(0),
  ads: z.number().int().min(0),
  teamMembers: z.number().int().min(0),
  storage: z.string().min(1),
  apiCalls: z.number().int().min(0)
})

// Usage validation
export const subscriptionUsageSchema = z.object({
  campaigns: z.number().int().min(0),
  adSets: z.number().int().min(0),
  ads: z.number().int().min(0),
  teamMembers: z.number().int().min(0),
  storage: z.number().min(0),
  apiCalls: z.number().int().min(0)
})

// Complete subscription validation
export const subscriptionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  planId: z.string().min(1),
  planName: z.string().min(1),
  tier: subscriptionTierSchema,
  status: subscriptionStatusSchema,
  billingCycle: billingCycleSchema,
  currentPeriodStart: z.string().datetime(),
  currentPeriodEnd: z.string().datetime(),
  cancelAtPeriodEnd: z.boolean(),
  features: z.array(z.string()),
  limits: subscriptionLimitsSchema,
  usage: subscriptionUsageSchema
})

// Feature access validation
export const featureAccessSchema = z.object({
  featureId: z.string().min(1),
  requiredTier: subscriptionTierSchema,
  isEnabled: z.boolean(),
  upgradePrompt: z.string().optional(),
  alternativeAction: z.string().optional()
})

// Billing information validation
export const billingInfoSchema = z.object({
  id: z.string().min(1),
  subscriptionId: z.string().min(1),
  nextBillingDate: z.string().datetime(),
  amount: z.number().min(0),
  currency: z.string().length(3),
  status: z.enum(['paid', 'pending', 'failed']),
  invoiceUrl: z.string().url().optional(),
  paymentMethod: z.object({
    type: z.enum(['card', 'bank_account']),
    last4: z.string().length(4),
    brand: z.string().optional()
  })
})

// Validation utilities
export class SubscriptionValidator {
  static validatePlanChange(data: unknown) {
    return planChangeRequestSchema.safeParse(data)
  }

  static validateSubscription(data: unknown) {
    return subscriptionSchema.safeParse(data)
  }

  static validateFeatureAccess(data: unknown) {
    return featureAccessSchema.safeParse(data)
  }

  static validateBillingInfo(data: unknown) {
    return billingInfoSchema.safeParse(data)
  }

  static validateUsageLimits(usage: unknown, limits: unknown) {
    const usageResult = subscriptionUsageSchema.safeParse(usage)
    const limitsResult = subscriptionLimitsSchema.safeParse(limits)

    if (!usageResult.success || !limitsResult.success) {
      return {
        success: false,
        error: 'Invalid usage or limits data'
      }
    }

    const usageData = usageResult.data
    const limitsData = limitsResult.data

    // Check if any usage exceeds limits (excluding unlimited values of -1)
    const violations: string[] = []

    if (limitsData.campaigns !== -1 && usageData.campaigns > limitsData.campaigns) {
      violations.push(`Campaigns: ${usageData.campaigns}/${limitsData.campaigns}`)
    }

    if (limitsData.adSets !== -1 && usageData.adSets > limitsData.adSets) {
      violations.push(`Ad Sets: ${usageData.adSets}/${limitsData.adSets}`)
    }

    if (limitsData.ads !== -1 && usageData.ads > limitsData.ads) {
      violations.push(`Ads: ${usageData.ads}/${limitsData.ads}`)
    }

    if (limitsData.teamMembers !== -1 && usageData.teamMembers > limitsData.teamMembers) {
      violations.push(`Team Members: ${usageData.teamMembers}/${limitsData.teamMembers}`)
    }

    const storageLimit = parseFloat(limitsData.storage)
    if (storageLimit !== -1 && usageData.storage > storageLimit) {
      violations.push(`Storage: ${usageData.storage}GB/${storageLimit}GB`)
    }

    if (limitsData.apiCalls !== -1 && usageData.apiCalls > limitsData.apiCalls) {
      violations.push(`API Calls: ${usageData.apiCalls}/${limitsData.apiCalls}`)
    }

    return {
      success: violations.length === 0,
      violations,
      error: violations.length > 0 ? `Usage limits exceeded: ${violations.join(', ')}` : undefined
    }
  }

  static validateTierUpgrade(currentTier: SubscriptionTier, targetTier: SubscriptionTier) {
    const tierOrder = { free: 0, pro: 1, enterprise: 2 }
    const currentOrder = tierOrder[currentTier]
    const targetOrder = tierOrder[targetTier]

    if (targetOrder <= currentOrder) {
      return {
        success: false,
        error: 'Target tier must be higher than current tier for upgrade'
      }
    }

    return {
      success: true
    }
  }

  static validateTierDowngrade(currentTier: SubscriptionTier, targetTier: SubscriptionTier) {
    const tierOrder = { free: 0, pro: 1, enterprise: 2 }
    const currentOrder = tierOrder[currentTier]
    const targetOrder = tierOrder[targetTier]

    if (targetOrder >= currentOrder) {
      return {
        success: false,
        error: 'Target tier must be lower than current tier for downgrade'
      }
    }

    return {
      success: true
    }
  }

  static validateBillingCycleChange(
    currentCycle: BillingCycle,
    targetCycle: BillingCycle,
    currentTier: SubscriptionTier
  ) {
    // Free tier doesn't have billing cycles
    if (currentTier === 'free') {
      return {
        success: false,
        error: 'Free tier does not support billing cycle changes'
      }
    }

    // Same cycle
    if (currentCycle === targetCycle) {
      return {
        success: false,
        error: 'Target billing cycle is the same as current cycle'
      }
    }

    return {
      success: true
    }
  }

  static validateSubscriptionStatus(status: string) {
    const result = subscriptionStatusSchema.safeParse(status)
    
    if (!result.success) {
      return {
        success: false,
        error: 'Invalid subscription status'
      }
    }

    return {
      success: true,
      data: result.data
    }
  }

  static validateFeatureId(featureId: string) {
    const validFeatures = [
      'campaigns',
      'adSets',
      'ads',
      'teamMembers',
      'storage',
      'apiCalls',
      'advanced_analytics',
      'team_management',
      'priority_support',
      'custom_integrations',
      'dedicated_support',
      'white_label'
    ]

    if (!validFeatures.includes(featureId)) {
      return {
        success: false,
        error: `Invalid feature ID: ${featureId}`
      }
    }

    return {
      success: true
    }
  }
}

// Runtime validation helpers
export const validateSubscriptionData = (data: unknown) => {
  return SubscriptionValidator.validateSubscription(data)
}

export const validatePlanChangeData = (data: unknown) => {
  return SubscriptionValidator.validatePlanChange(data)
}

export const validateUsageLimits = (usage: unknown, limits: unknown) => {
  return SubscriptionValidator.validateUsageLimits(usage, limits)
}

export const validateTierChange = (
  currentTier: SubscriptionTier,
  targetTier: SubscriptionTier,
  isUpgrade: boolean
) => {
  return isUpgrade
    ? SubscriptionValidator.validateTierUpgrade(currentTier, targetTier)
    : SubscriptionValidator.validateTierDowngrade(currentTier, targetTier)
}

// Type exports
export type PlanChangeRequest = z.infer<typeof planChangeRequestSchema>
export type SubscriptionLimits = z.infer<typeof subscriptionLimitsSchema>
export type SubscriptionUsage = z.infer<typeof subscriptionUsageSchema>
export type FeatureAccess = z.infer<typeof featureAccessSchema>
export type BillingInfo = z.infer<typeof billingInfoSchema>
