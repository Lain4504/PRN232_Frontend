'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, Crown, Building2, Zap } from 'lucide-react'
import { useFeatureGate } from '@/hooks/use-feature-gate'
import { useSubscription } from '@/hooks/use-subscription'
import Link from 'next/link'

interface FeatureGateProps {
  featureId: string
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
  className?: string
}

export function FeatureGate({ 
  featureId, 
  children, 
  fallback,
  showUpgradePrompt = true,
  className = '' 
}: FeatureGateProps) {
  const { canAccess, featureGate, isLoading } = useFeatureGate(featureId)
  const { data: subscription } = useSubscription()

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (canAccess) {
    return <div className={className}>{children}</div>
  }

  if (fallback) {
    return <div className={className}>{fallback}</div>
  }

  if (!showUpgradePrompt) {
    return null
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'pro':
        return <Crown className="h-5 w-5 text-purple-500" />
      case 'enterprise':
        return <Building2 className="h-5 w-5 text-orange-500" />
      default:
        return <Zap className="h-5 w-5 text-blue-500" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'pro':
        return 'border-purple-200 bg-purple-50'
      case 'enterprise':
        return 'border-orange-200 bg-orange-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <Card className={`${getTierColor(featureGate?.requiredTier || 'free')} ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-white border-2 border-current">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <CardTitle className="text-lg">Feature Not Available</CardTitle>
        <CardDescription>
          This feature requires a {featureGate?.requiredTier || 'higher'} plan
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        {featureGate?.upgradePrompt && (
          <p className="text-sm text-muted-foreground">
            {featureGate.upgradePrompt}
          </p>
        )}

        <div className="flex items-center justify-center space-x-2">
          {getTierIcon(featureGate?.requiredTier || 'free')}
          <Badge variant="outline" className="capitalize">
            {featureGate?.requiredTier || 'Free'} Plan Required
          </Badge>
        </div>

        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/subscription/plans">
              Upgrade Plan
            </Link>
          </Button>
          
          {featureGate?.alternativeAction && (
            <Button variant="outline" size="sm" className="w-full">
              {featureGate.alternativeAction}
            </Button>
          )}
        </div>

        {subscription && (
          <div className="text-xs text-muted-foreground">
            Current plan: <span className="font-medium capitalize">{subscription.tier}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Higher-order component for feature gating
export function withFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  featureId: string,
  fallback?: ReactNode
) {
  return function FeatureGatedComponent(props: P) {
    return (
      <FeatureGate featureId={featureId} fallback={fallback}>
        <Component {...props} />
      </FeatureGate>
    )
  }
}

// Hook for conditional rendering based on feature access
export function useFeatureGateRender(featureId: string) {
  const { canAccess, isLoading } = useFeatureGate(featureId)

  return {
    canAccess,
    isLoading,
    render: (children: ReactNode, fallback?: ReactNode) => {
      if (isLoading) {
        return <div className="animate-pulse">Loading...</div>
      }
      
      if (canAccess) {
        return children
      }
      
      return fallback || null
    }
  }
}
