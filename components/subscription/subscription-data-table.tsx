'use client'

import { ReactNode } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  AlertTriangle, 
  Lock, 
  Crown, 
  Building2, 
  Zap,
  Plus
} from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import { useFeatureGate } from '@/hooks/use-feature-gate'
import { getUsagePercentage, isUsageNearLimit } from '@/lib/utils/subscription'
import { UpgradePrompt } from './upgrade-prompt'
import type { ColumnDef } from '@tanstack/react-table'

interface SubscriptionDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  featureId: string
  limitKey: keyof T
  usageKey: keyof T
  onAddNew?: () => void
  addNewLabel?: string
  showUsageWarning?: boolean
  showUpgradePrompt?: boolean
  className?: string
}

export function SubscriptionDataTable<T>({
  data,
  columns,
  featureId,
  limitKey,
  usageKey,
  onAddNew,
  addNewLabel = 'Add New',
  showUsageWarning = true,
  showUpgradePrompt = true,
  className = ''
}: SubscriptionDataTableProps<T>) {
  const { data: subscription } = useSubscription()
  const { canAccess, featureGate, usagePercentage, isNearLimit } = useFeatureGate(featureId)

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Zap className="h-4 w-4 text-blue-500" />
      case 'pro':
        return <Crown className="h-4 w-4 text-purple-500" />
      case 'enterprise':
        return <Building2 className="h-4 w-4 text-orange-500" />
      default:
        return <Zap className="h-4 w-4 text-gray-500" />
    }
  }

  const isAtLimit = !canAccess && subscription && 
    (subscription.usage[featureId as keyof typeof subscription.usage] as number) >= 
    (subscription.limits[featureId as keyof typeof subscription.limits] as number)

  const canAddNew = canAccess && !isAtLimit

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Usage Warning */}
      {showUsageWarning && subscription && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {featureId.charAt(0).toUpperCase() + featureId.slice(1)} Usage
            </span>
            <span className="text-muted-foreground">
              {subscription.usage[featureId as keyof typeof subscription.usage]} / {
                subscription.limits[featureId as keyof typeof subscription.limits] === -1 
                  ? 'Unlimited' 
                  : subscription.limits[featureId as keyof typeof subscription.limits]
              }
            </span>
          </div>
          
          {subscription.limits[featureId as keyof typeof subscription.limits] !== -1 && (
            <Progress 
              value={usagePercentage} 
              className="h-2"
            />
          )}

          {isNearLimit && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You&apos;re approaching your {featureId} limit. Consider upgrading your plan.
              </AlertDescription>
            </Alert>
          )}

          {isAtLimit && (
            <Alert variant="destructive">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                You&apos;ve reached your {featureId} limit. Upgrade your plan to add more.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Add New Button */}
      {onAddNew && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getPlanIcon(subscription?.tier || 'free')}
            <span className="text-sm font-medium">
              {subscription?.planName || 'Free'} Plan
            </span>
            {subscription?.tier !== 'free' && (
              <Badge variant="outline" className="text-xs">
                {subscription.tier}
              </Badge>
            )}
          </div>
          
          {canAddNew ? (
            <Button onClick={onAddNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {addNewLabel}
            </Button>
          ) : (
            <Button 
              onClick={onAddNew} 
              size="sm" 
              variant="outline"
              disabled
              className="opacity-50"
            >
              <Lock className="h-4 w-4 mr-2" />
              {addNewLabel}
            </Button>
          )}
        </div>
      )}

      {/* Data Table */}
      {canAccess ? (
        <DataTable data={data} columns={columns} />
      ) : showUpgradePrompt ? (
        <UpgradePrompt
          featureId={featureId}
          title={`${featureId.charAt(0).toUpperCase() + featureId.slice(1)} Management`}
          description={`Manage your ${featureId} with advanced features and higher limits.`}
          variant="card"
        />
      ) : (
        <div className="text-center py-8">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Feature Not Available</h3>
          <p className="text-muted-foreground">
            This feature requires a {featureGate?.requiredTier || 'higher'} plan.
          </p>
        </div>
      )}
    </div>
  )
}

// Specialized table components for common features
export function CampaignDataTable<T>(props: Omit<SubscriptionDataTableProps<T>, 'featureId' | 'limitKey' | 'usageKey'>) {
  const { ...restProps } = props;
  return (
    <SubscriptionDataTable
      {...restProps}
      featureId="campaigns"
      limitKey={"limit" as keyof T}
      usageKey={"usage" as keyof T}
    />
  )
}

export function AdSetDataTable<T>(props: Omit<SubscriptionDataTableProps<T>, 'featureId' | 'limitKey' | 'usageKey'>) {
  const { ...restProps } = props;
  return (
    <SubscriptionDataTable
      {...restProps}
      featureId="adSets"
      limitKey={"limit" as keyof T}
      usageKey={"usage" as keyof T}
    />
  )
}

export function AdDataTable<T>(props: Omit<SubscriptionDataTableProps<T>, 'featureId' | 'limitKey' | 'usageKey'>) {
  const { ...restProps } = props;
  return (
    <SubscriptionDataTable
      {...restProps}
      featureId="ads"
      limitKey={"limit" as keyof T}
      usageKey={"usage" as keyof T}
    />
  )
}

export function TeamMemberDataTable<T>(props: Omit<SubscriptionDataTableProps<T>, 'featureId' | 'limitKey' | 'usageKey'>) {
  const { ...restProps } = props;
  return (
    <SubscriptionDataTable
      {...restProps}
      featureId="teamMembers"
      limitKey={"limit" as keyof T}
      usageKey={"usage" as keyof T}
    />
  )
}
