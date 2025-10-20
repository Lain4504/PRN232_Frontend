'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import type { SubscriptionPlan } from '@/lib/types/subscription'

interface SubscriptionManagementProps {
  className?: string
}

export function SubscriptionManagement({ className = '' }: SubscriptionManagementProps) {
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const { data: subscription, isLoading } = useSubscription()
  const cancelSubscriptionMutation = useCancelSubscription()

  const handlePlanChange = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setShowPlanChangeDialog(true)
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.'
    )

    if (!confirmed) return

    try {
      await cancelSubscriptionMutation.mutateAsync()
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

  if (!subscription) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <h2 className="text-2xl font-semibold">Unable to load subscription</h2>
        <p className="text-muted-foreground mt-2">
          Please try refreshing the page or contact support.
        </p>
      </div>
    )
  }

  const daysUntilBilling = getDaysUntilBilling(subscription)
  const nextBillingDate = new Date(subscription.currentPeriodEnd)

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
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getStatusIcon(subscription.status)}
                  <span>Subscription Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className={getStatusColor(subscription.status)}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plan</span>
                  <span className="font-medium">{subscription.planName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Billing Cycle</span>
                  <span className="font-medium capitalize">{subscription.billingCycle}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Billing</span>
                  <span className="font-medium">{formatBillingDate(nextBillingDate)}</span>
                </div>

                {subscription.cancelAtPeriodEnd && (
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
                
                {subscription.tier !== 'free' && (
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
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
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
                    {formatPrice(subscription.tier === 'free' ? 0 : 29)}
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
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
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
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
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
        </TabsContent>
      </Tabs>

      {/* Plan Change Dialog */}
      {selectedPlan && (
        <PlanChangeDialog
          open={showPlanChangeDialog}
          onOpenChange={setShowPlanChangeDialog}
          targetPlan={selectedPlan}
          currentSubscription={subscription}
        />
      )}
    </div>
  )
}
