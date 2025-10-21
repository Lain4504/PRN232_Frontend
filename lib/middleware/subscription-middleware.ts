import { NextRequest, NextResponse } from 'next/server'
import type { SubscriptionTier } from '@/lib/types/subscription'

// Route protection based on subscription tier
export interface SubscriptionRouteConfig {
  path: string
  requiredTier: SubscriptionTier
  redirectTo?: string
}

// Define protected routes and their required subscription tiers
export const SUBSCRIPTION_ROUTES: SubscriptionRouteConfig[] = [
  {
    path: '/dashboard/analytics',
    requiredTier: 'pro',
    redirectTo: '/subscription/plans'
  },
  {
    path: '/dashboard/team',
    requiredTier: 'pro',
    redirectTo: '/subscription/plans'
  },
  {
    path: '/dashboard/teams',
    requiredTier: 'pro',
    redirectTo: '/subscription/plans'
  },
  {
    path: '/dashboard/advanced-reports',
    requiredTier: 'enterprise',
    redirectTo: '/subscription/plans'
  },
  {
    path: '/dashboard/custom-integrations',
    requiredTier: 'enterprise',
    redirectTo: '/subscription/plans'
  }
]

// Tier hierarchy for comparison
const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  enterprise: 2
}

export function hasRequiredTier(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier]
}

export function getSubscriptionMiddleware() {
  return async function subscriptionMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Find matching route configuration
    const routeConfig = SUBSCRIPTION_ROUTES.find(route => 
      pathname.startsWith(route.path)
    )

    if (!routeConfig) {
      return NextResponse.next()
    }

    // Get user subscription from headers (set by auth middleware)
    const userTier = request.headers.get('x-user-subscription-tier') as SubscriptionTier
    const subscriptionStatus = request.headers.get('x-user-subscription-status')

    // Debug logging
    console.log('Subscription middleware debug:', {
      pathname: pathname,
      userTier,
      subscriptionStatus,
      routeConfig
    })

    // If no subscription info, redirect to login
    if (!userTier || !subscriptionStatus) {
      console.log('No subscription info, redirecting to login')
      // Temporarily allow teams route without subscription
      if (pathname.startsWith('/dashboard/teams')) {
        console.log('Allowing teams route without subscription')
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Check if subscription is active
    if (subscriptionStatus !== 'active' && subscriptionStatus !== 'trialing') {
      return NextResponse.redirect(new URL('/subscription/plans', request.url))
    }

    // Check if user has required tier
    if (!hasRequiredTier(userTier, routeConfig.requiredTier)) {
      const redirectUrl = routeConfig.redirectTo || '/subscription/plans'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    return NextResponse.next()
  }
}

// Client-side subscription validation
export function validateSubscriptionAccess(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier,
  subscriptionStatus: string
): {
  hasAccess: boolean
  redirectTo?: string
  reason?: string
} {
  // Check if subscription is active
  if (subscriptionStatus !== 'active' && subscriptionStatus !== 'trialing') {
    return {
      hasAccess: false,
      redirectTo: '/subscription/plans',
      reason: 'Subscription is not active'
    }
  }

  // Check tier access
  if (!hasRequiredTier(userTier, requiredTier)) {
    return {
      hasAccess: false,
      redirectTo: '/subscription/plans',
      reason: `This feature requires a ${requiredTier} plan or higher`
    }
  }

  return {
    hasAccess: true
  }
}

// Feature access validation
export async function validateFeatureAccess(
  featureId: string,
  userTier: SubscriptionTier,
  subscriptionStatus: string
): Promise<{
  hasAccess: boolean
  upgradePrompt?: string
  requiredTier?: SubscriptionTier
}> {
  // Import feature gates dynamically to avoid circular dependencies
  const { FEATURE_GATES } = await import('@/lib/constants/subscription-plans')
  
  const featureGate = FEATURE_GATES[featureId]
  if (!featureGate) {
    return { hasAccess: true } // Feature not gated
  }

  const tierGate = featureGate[userTier]
  if (!tierGate) {
    return {
      hasAccess: false,
      upgradePrompt: `This feature is not available for ${userTier} plans`,
      requiredTier: 'pro'
    }
  }

  // Check if subscription is active
  if (subscriptionStatus !== 'active' && subscriptionStatus !== 'trialing') {
    return {
      hasAccess: false,
      upgradePrompt: 'Please activate your subscription to access this feature',
      requiredTier: 'pro'
    }
  }

  return {
    hasAccess: tierGate.limit === -1 || true, // Simplified for now
    upgradePrompt: tierGate.upgradePrompt,
    requiredTier: userTier === 'free' ? 'pro' : 'enterprise'
  }
}
