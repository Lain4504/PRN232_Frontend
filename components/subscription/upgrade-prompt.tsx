'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Crown, Building2, Zap, ArrowRight, Star } from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import { useFeatureGate } from '@/hooks/use-feature-gate'
import Link from 'next/link'

interface UpgradePromptProps {
  featureId?: string
  requiredTier?: 'pro' | 'enterprise'
  title?: string
  description?: string
  showCurrentPlan?: boolean
  showBenefits?: boolean
  variant?: 'card' | 'alert' | 'inline'
  className?: string
}

export function UpgradePrompt({
  featureId,
  requiredTier,
  title,
  description,
  showCurrentPlan = true,
  showBenefits = true,
  variant = 'card',
  className = ''
}: UpgradePromptProps) {
  const { data: subscription } = useSubscription()
  const { featureGate } = useFeatureGate(featureId || '')

  // Determine the required tier
  const targetTier = requiredTier || featureGate?.requiredTier || 'pro'
  
  // Get upgrade prompt text
  const upgradeText = featureGate?.upgradePrompt || 
    `Upgrade to ${targetTier === 'pro' ? 'Pro' : 'Enterprise'} to access this feature`

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

  const getTierBenefits = (tier: string) => {
    switch (tier) {
      case 'pro':
        return [
          'Unlimited campaigns and ad sets',
          'Advanced analytics and reporting',
          'Priority customer support',
          'Team management features',
          'Custom integrations'
        ]
      case 'enterprise':
        return [
          'Everything in Pro',
          'Unlimited team members',
          'Dedicated account manager',
          'White label options',
          'SLA guarantee',
          'Custom training'
        ]
      default:
        return []
    }
  }

  const benefits = getTierBenefits(targetTier)

  if (variant === 'alert') {
    return (
      <Alert className={`${getTierColor(targetTier)} ${className}`}>
        <div className="flex items-center space-x-2">
          {getTierIcon(targetTier)}
          <AlertDescription className="flex-1">
            <div className="flex items-center justify-between">
              <span>{upgradeText}</span>
              <Button asChild size="sm" variant="outline">
                <Link href="/subscription/plans">
                  Upgrade
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </div>
      </Alert>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${getTierColor(targetTier)} ${className}`}>
        <div className="flex items-center space-x-2">
          {getTierIcon(targetTier)}
          <span className="text-sm font-medium">{upgradeText}</span>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/subscription/plans">
            Upgrade
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    )
  }

  // Default card variant
  return (
    <Card className={`${getTierColor(targetTier)} ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 rounded-full bg-white border-2 border-current">
            {getTierIcon(targetTier)}
          </div>
        </div>
        <CardTitle className="text-lg">
          {title || `Upgrade to ${targetTier === 'pro' ? 'Pro' : 'Enterprise'}`}
        </CardTitle>
        <CardDescription>
          {description || upgradeText}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showBenefits && benefits.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">What you&apos;ll get:</h4>
            <ul className="space-y-1">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-center space-x-2">
          <Badge variant="outline" className="capitalize">
            {targetTier} Plan
          </Badge>
        </div>

        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/subscription/plans">
              Upgrade Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          
          <Button variant="outline" size="sm" className="w-full">
            Learn More
          </Button>
        </div>

        {showCurrentPlan && subscription && (
          <div className="text-xs text-muted-foreground text-center">
            Current plan: <span className="font-medium capitalize">{subscription.tier}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Specialized upgrade prompts for common scenarios
export function CampaignLimitPrompt({ className = '' }: { className?: string }) {
  return (
    <UpgradePrompt
      featureId="campaigns"
      title="Campaign Limit Reached"
      description="You've reached your campaign limit. Upgrade to create more campaigns."
      variant="alert"
      className={className}
    />
  )
}

export function TeamLimitPrompt({ className = '' }: { className?: string }) {
  return (
    <UpgradePrompt
      featureId="teamMembers"
      title="Team Member Limit Reached"
      description="You've reached your team member limit. Upgrade to add more team members."
      variant="alert"
      className={className}
    />
  )
}

export function AnalyticsPrompt({ className = '' }: { className?: string }) {
  return (
    <UpgradePrompt
      featureId="advanced_analytics"
      title="Advanced Analytics"
      description="Get detailed insights and custom reports with advanced analytics."
      requiredTier="pro"
      variant="card"
      className={className}
    />
  )
}

export function SupportPrompt({ className = '' }: { className?: string }) {
  return (
    <UpgradePrompt
      featureId="priority_support"
      title="Priority Support"
      description="Get faster response times and dedicated support."
      requiredTier="pro"
      variant="inline"
      className={className}
    />
  )
}
