'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu'
import { 
  Crown, 
  Building2, 
  Zap, 
  ChevronDown, 
  CreditCard, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import { getSubscriptionStatusColor, getSubscriptionStatusText } from '@/lib/utils/subscription'
import Link from 'next/link'

interface SubscriptionStatusIndicatorProps {
  variant?: 'badge' | 'dropdown' | 'inline'
  showUpgradeButton?: boolean
  className?: string
}

export function SubscriptionStatusIndicator({ 
  variant = 'badge',
  showUpgradeButton = true,
  className = '' 
}: SubscriptionStatusIndicatorProps) {
  const { data: subscription, isLoading } = useSubscription()

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'trialing':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'past_due':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    )
  }

  if (!subscription) {
    return null
  }

  const statusColor = getSubscriptionStatusColor(subscription.status)
  const statusText = getSubscriptionStatusText(subscription.status)

  if (variant === 'badge') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {getPlanIcon(subscription.tier)}
        <Badge 
          variant={statusColor === 'green' ? 'default' : 'secondary'}
          className={`${
            statusColor === 'green' ? 'bg-green-100 text-green-800' :
            statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
            statusColor === 'red' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}
        >
          {subscription.planName}
        </Badge>
        {getStatusIcon(subscription.status)}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        {getPlanIcon(subscription.tier)}
        <span className="font-medium">{subscription.planName}</span>
        <Badge 
          variant="outline" 
          className={`text-xs ${
            statusColor === 'green' ? 'border-green-200 text-green-700' :
            statusColor === 'yellow' ? 'border-yellow-200 text-yellow-700' :
            statusColor === 'red' ? 'border-red-200 text-red-700' :
            'border-gray-200 text-gray-700'
          }`}
        >
          {statusText}
        </Badge>
      </div>
    )
  }

  // Dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`flex items-center space-x-2 ${className}`}>
          {getPlanIcon(subscription.tier)}
          <span className="hidden sm:inline">{subscription.planName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2">
          <div className="flex items-center space-x-2">
            {getPlanIcon(subscription.tier)}
            <div>
              <div className="font-medium">{subscription.planName}</div>
              <div className="text-sm text-muted-foreground">
                {subscription.billingCycle === 'yearly' ? 'Annual' : 'Monthly'} billing
              </div>
            </div>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="px-3 py-2">
          <div className="flex items-center space-x-2 text-sm">
            {getStatusIcon(subscription.status)}
            <span>Status: {statusText}</span>
          </div>
          {subscription.cancelAtPeriodEnd && (
            <div className="text-xs text-orange-600 mt-1">
              Cancels at end of period
            </div>
          )}
        </div>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/subscription" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Subscription
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/subscription/billing" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Billing Settings
          </Link>
        </DropdownMenuItem>
        
        {showUpgradeButton && subscription.tier !== 'enterprise' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/subscription/plans" className="flex items-center text-primary">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Compact version for headers and navigation
export function CompactSubscriptionStatus({ className = '' }: { className?: string }) {
  const { data: subscription, isLoading } = useSubscription()

  if (isLoading || !subscription) {
    return null
  }

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Zap className="h-3 w-3 text-blue-500" />
      case 'pro':
        return <Crown className="h-3 w-3 text-purple-500" />
      case 'enterprise':
        return <Building2 className="h-3 w-3 text-orange-500" />
      default:
        return <Zap className="h-3 w-3 text-gray-500" />
    }
  }

  return (
    <div className={`flex items-center space-x-1 text-xs ${className}`}>
      {getPlanIcon(subscription.tier)}
      <span className="font-medium">{subscription.planName}</span>
    </div>
  )
}
