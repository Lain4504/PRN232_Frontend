"use client"

import { ReactNode } from 'react'
import { useProfile } from '@/lib/contexts/profile-context'
import { ProfileTypeEnum, getFeatureErrorMessage } from '@/lib/utils/profile-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface FeatureGuardProps {
  feature: string
  requiredTier?: ProfileTypeEnum
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
}

export function FeatureGuard({ 
  feature, 
  requiredTier, 
  children, 
  fallback,
  showUpgradePrompt = true 
}: FeatureGuardProps) {
  const { profileType, hasFeatureAccess } = useProfile()

  // Check if user has access to this feature
  const hasAccess = hasFeatureAccess(feature)

  if (hasAccess) {
    return <>{children}</>
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Show upgrade prompt
  if (showUpgradePrompt) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">Feature Not Available</CardTitle>
          <CardDescription>
            {getFeatureErrorMessage(profileType, feature)}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4">
            <Badge variant="outline" className="mb-2">
              Current: {profileType === ProfileTypeEnum.Free ? 'Free' : 
                       profileType === ProfileTypeEnum.Basic ? 'Basic' : 'Pro'}
            </Badge>
            {requiredTier && (
              <Badge variant="secondary" className="ml-2">
                Required: {requiredTier === ProfileTypeEnum.Basic ? 'Basic' : 'Pro'}
              </Badge>
            )}
          </div>
          <Button asChild>
            <Link href={`/subscription?profileId=${localStorage.getItem('activeProfileId')}`}>
              Upgrade Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Return nothing if no access and no upgrade prompt
  return null
}

// HOC version for wrapping components
export function withFeatureGuard<P extends object>(
  Component: React.ComponentType<P>,
  feature: string,
  requiredTier?: ProfileTypeEnum
) {
  return function FeatureGuardedComponent(props: P) {
    return (
      <FeatureGuard feature={feature} requiredTier={requiredTier}>
        <Component {...props} />
      </FeatureGuard>
    )
  }
}

// Hook for checking feature access in components
export function useFeatureGuard(feature: string) {
  const { hasFeatureAccess, profileType } = useProfile()
  
  return {
    hasAccess: hasFeatureAccess(feature),
    profileType,
    errorMessage: getFeatureErrorMessage(profileType, feature)
  }
}
