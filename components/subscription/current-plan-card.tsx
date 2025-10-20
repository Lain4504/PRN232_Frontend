'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Zap, Crown, Building2, Calendar, CreditCard, Users, HardDrive, Activity } from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import { formatPrice } from '@/lib/constants/subscription-plans'
import { getSubscriptionStatusColor, getSubscriptionStatusText, getDaysUntilBilling } from '@/lib/utils/subscription'
import Link from 'next/link'

interface CurrentPlanCardProps {
  showUsage?: boolean
  showActions?: boolean
  className?: string
}

export function CurrentPlanCard({ 
  showUsage = true, 
  showActions = true,
  className = '' 
}: CurrentPlanCardProps) {
  const { data: subscription, isLoading, error } = useSubscription()

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Zap className="h-6 w-6 text-blue-500" />
      case 'pro':
        return <Crown className="h-6 w-6 text-purple-500" />
      case 'enterprise':
        return <Building2 className="h-6 w-6 text-orange-500" />
      default:
        return <Zap className="h-6 w-6 text-gray-500" />
    }
  }

  const getUsagePercentage = (used: number, limit: number | string) => {
    if (typeof limit === 'string') {
      const numericLimit = parseFloat(limit)
      return Math.min((used / numericLimit) * 100, 100)
    }
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const formatUsage = (used: number, limit: number | string) => {
    if (typeof limit === 'string') {
      return `${used} / ${limit}`
    }
    if (limit === -1) return `${used} / Unlimited`
    return `${used} / ${limit}`
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !subscription) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Unable to load subscription information</p>
        </CardContent>
      </Card>
    )
  }

  const statusColor = getSubscriptionStatusColor(subscription.status)
  const statusText = getSubscriptionStatusText(subscription.status)
  const daysUntilBilling = getDaysUntilBilling(subscription)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getPlanIcon(subscription.tier)}
            <div>
              <CardTitle className="text-lg">{subscription.planName}</CardTitle>
              <CardDescription>
                {subscription.billingCycle === 'yearly' ? 'Annual' : 'Monthly'} billing
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={statusColor === 'green' ? 'default' : 'secondary'}
            className={`${
              statusColor === 'green' ? 'bg-green-100 text-green-800' :
              statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              statusColor === 'red' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            {statusText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Billing Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Next billing date</span>
            </div>
            <span className="font-medium">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          </div>
          
          {daysUntilBilling > 0 && (
            <div className="text-sm text-muted-foreground">
              {daysUntilBilling} days remaining in current period
            </div>
          )}

          {subscription.cancelAtPeriodEnd && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              Your subscription will be cancelled at the end of the current period
            </div>
          )}
        </div>

        {/* Usage Statistics */}
        {showUsage && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Usage This Month</h4>
            
            <div className="space-y-3">
              {/* Campaigns */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Campaigns</span>
                  </div>
                  <span className="font-mono text-sm">
                    {formatUsage(subscription.usage.campaigns, subscription.limits.campaigns)}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.usage.campaigns, subscription.limits.campaigns)}
                  className="h-2"
                />
              </div>

              {/* Ad Sets */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Ad Sets</span>
                  </div>
                  <span className="font-mono text-sm">
                    {formatUsage(subscription.usage.adSets, subscription.limits.adSets)}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.usage.adSets, subscription.limits.adSets)}
                  className="h-2"
                />
              </div>

              {/* Ads */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Ads</span>
                  </div>
                  <span className="font-mono text-sm">
                    {formatUsage(subscription.usage.ads, subscription.limits.ads)}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.usage.ads, subscription.limits.ads)}
                  className="h-2"
                />
              </div>

              {/* Team Members */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Team Members</span>
                  </div>
                  <span className="font-mono text-sm">
                    {formatUsage(subscription.usage.teamMembers, subscription.limits.teamMembers)}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.usage.teamMembers, subscription.limits.teamMembers)}
                  className="h-2"
                />
              </div>

              {/* Storage */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span>Storage</span>
                  </div>
                  <span className="font-mono text-sm">
                    {formatUsage(subscription.usage.storage, subscription.limits.storage)}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.usage.storage, subscription.limits.storage)}
                  className="h-2"
                />
              </div>

              {/* API Calls */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>API Calls</span>
                  </div>
                  <span className="font-mono text-sm">
                    {formatUsage(subscription.usage.apiCalls, subscription.limits.apiCalls)}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.usage.apiCalls, subscription.limits.apiCalls)}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex space-x-2 pt-4 border-t">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href="/subscription/plans">
                Change Plan
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href="/subscription/billing">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
