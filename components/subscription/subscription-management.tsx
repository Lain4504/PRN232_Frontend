'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CustomTabs, CustomTabItem } from '@/components/ui/custom-tabs'
import { 
  CreditCard, 
  Calendar, 
  Settings, 
  History, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  Download
} from 'lucide-react'
import { useSubscription, useCancelSubscription } from '@/hooks/use-subscription'
import { CurrentPlanCard } from './current-plan-card'
import { PlanChangeDialog } from './plan-change-dialog'
import { formatPrice, getPlanById } from '@/lib/constants/subscription-plans'
import { getDaysUntilBilling, formatBillingDate } from '@/lib/utils/subscription'
import { toast } from 'sonner'
import type { SubscriptionPlan, Subscription } from '@/lib/types/subscription'
import { useProfile } from '@/lib/contexts/profile-context'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'

interface SubscriptionManagementProps {
  className?: string
  profileId?: string
}

// Helper function to create fallback subscription from profile type
const createFallbackSubscription = (
  profileType: number,
  profileId?: string
): Subscription | null => {
  if (!profileId) return null

  const tierMap = ['free', 'basic', 'pro'] as const
  const tier = tierMap[profileType] || 'free'

  return {
    id: `profile-${profileId}`,
    profileId: profileId,
    plan: profileType,
    planName: tier.charAt(0).toUpperCase() + tier.slice(1),
    tier,
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
    features: [],
    limits: {
      campaigns: profileType === 2 ? -1 : profileType === 1 ? 15 : 3,
      adSets: profileType === 2 ? -1 : profileType === 1 ? 50 : 10,
      ads: profileType === 2 ? -1 : profileType === 1 ? 200 : 50,
      teamMembers: profileType === 2 ? 20 : profileType === 1 ? 5 : 1,
      storage: profileType === 2 ? '100' : profileType === 1 ? '25' : '1',
      apiCalls: profileType === 2 ? -1 : profileType === 1 ? 5000 : 1000
    },
    usage: {
      campaigns: 0,
      adSets: 0,
      ads: 0,
      teamMembers: 0,
      storage: 0,
      apiCalls: 0
    }
  }
}

export function SubscriptionManagement({ className = '', profileId }: SubscriptionManagementProps) {
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const { data: subscription, isLoading } = useSubscription(profileId)
  const { profileType } = useProfile()
  const cancelSubscriptionMutation = useCancelSubscription()

  // Create fallback subscription if API returns null but we have profile type
  const effectiveSubscription = subscription || createFallbackSubscription(profileType, profileId)

  const handlePlanChange = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setShowPlanChangeDialog(true)
  }

  const handleCancelSubscription = async () => {
    if (!effectiveSubscription) return

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.'
    )

    if (!confirmed) return

    try {
      await cancelSubscriptionMutation.mutateAsync({
        subscriptionId: effectiveSubscription.id,
        reason: 'User requested cancellation'
      })
      toast.success('Subscription cancelled successfully')
    } catch (error) {
      console.error('Cancellation error:', error)
      toast.error('Failed to cancel subscription. Please try again.')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'past_due':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'trialing':
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      case 'trialing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!effectiveSubscription) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <h2 className="text-2xl font-semibold">Unable to load subscription</h2>
        <p className="text-muted-foreground mt-2">
          Please try refreshing the page or contact support.
        </p>
      </div>
    )
  }

  const daysUntilBilling = getDaysUntilBilling(effectiveSubscription)
  const nextBillingDate = new Date(effectiveSubscription.currentPeriodEnd)

  const tabItems: CustomTabItem[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'billing', label: 'Billing' },
    { value: 'history', label: 'History' },
    { value: 'settings', label: 'Settings' }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription, billing, and plan settings
        </p>
      </div>

      {/* Current Plan Overview */}
      <CurrentPlanCard showUsage={true} showActions={false} />

      {/* Main Content Tabs */}
      <div className="space-y-6">
        <CustomTabs
          items={tabItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(effectiveSubscription.status)}
                  <span>Subscription Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={getStatusColor(effectiveSubscription.status)}>
                    {effectiveSubscription.status.charAt(0).toUpperCase() + effectiveSubscription.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plan</span>
                  <span className="font-medium">{effectiveSubscription.planName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Billing Cycle</span>
                  <span className="font-medium capitalize">{effectiveSubscription.billingCycle}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Billing</span>
                  <span className="font-medium">{formatBillingDate(nextBillingDate)}</span>
                </div>

                {effectiveSubscription.cancelAtPeriodEnd && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your subscription will be cancelled at the end of the current period
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => handlePlanChange(getPlanById('pro')!)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Change Plan
                </Button>
                
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
                
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                
                {effectiveSubscription.tier !== 'free' && (
                  <Button 
                    onClick={handleCancelSubscription}
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    variant="outline"
                    disabled={cancelSubscriptionMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {cancelSubscriptionMutation.isPending ? 'Cancelling...' : 'Cancel Subscription'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Billing Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Payment</span>
                  <span className="font-medium">
                    {formatPrice(effectiveSubscription.tier === 'free' ? 0 : 29)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Date</span>
                  <span className="font-medium">{formatBillingDate(nextBillingDate)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Days Until Billing</span>
                  <span className="font-medium">{daysUntilBilling} days</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Method</span>
                  <span className="font-medium">•••• 4242</span>
                </div>
              </CardContent>
            </Card>

            {/* Billing History Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Recent Billing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>December 2024</span>
                    <span className="font-medium">{formatPrice(29)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>November 2024</span>
                    <span className="font-medium">{formatPrice(29)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>October 2024</span>
                    <span className="font-medium">{formatPrice(29)}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All History
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View all your past invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Billing History</h3>
                <p className="text-muted-foreground mb-4">
                  Your billing history will appear here
                </p>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download All Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Settings</CardTitle>
              <CardDescription>
                Manage your subscription preferences and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Settings</h3>
                <p className="text-muted-foreground">
                  Subscription settings will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>

      {/* Plan Change Dialog */}
      {selectedPlan && effectiveSubscription && (
        <PlanChangeDialog
          open={showPlanChangeDialog}
          onOpenChange={setShowPlanChangeDialog}
          targetPlan={selectedPlan}
          currentSubscription={effectiveSubscription}
        />
      )}
    </div>
  )
}
