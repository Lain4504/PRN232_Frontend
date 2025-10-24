'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Calendar, 
  Users, 
  HardDrive, 
  TrendingUp, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Zap,
  Crown,
  Building2
} from 'lucide-react'
import { getUserSubscriptions, cancelSubscription } from '@/lib/api/subscription'
import { formatCurrency } from '@/lib/stripe'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    try {
      const data = await getUserSubscriptions()
      setSubscriptions(data)
    } catch (error) {
      console.error('Error loading subscriptions:', error)
      toast.error('Failed to load subscriptions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      return
    }

    setCancellingId(subscriptionId)
    try {
      await cancelSubscription(subscriptionId)
      toast.success('Subscription cancelled successfully')
      loadSubscriptions()
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error('Failed to cancel subscription')
    } finally {
      setCancellingId(null)
    }
  }

  const getPlanIcon = (plan: number) => {
    switch (plan) {
      case SubscriptionPlanEnum.Free:
        return <Zap className="h-5 w-5 text-blue-500" />
      case SubscriptionPlanEnum.Basic:
        return <Crown className="h-5 w-5 text-purple-500" />
      case SubscriptionPlanEnum.Pro:
        return <Building2 className="h-5 w-5 text-orange-500" />
      default:
        return <Zap className="h-5 w-5 text-gray-500" />
    }
  }

  const getPlanName = (plan: number) => {
    switch (plan) {
      case SubscriptionPlanEnum.Free:
        return 'Free'
      case SubscriptionPlanEnum.Basic:
        return 'Basic'
      case SubscriptionPlanEnum.Pro:
        return 'Pro'
      default:
        return 'Unknown'
    }
  }

  const getPlanColor = (plan: number) => {
    switch (plan) {
      case SubscriptionPlanEnum.Free:
        return 'bg-blue-100 text-blue-800'
      case SubscriptionPlanEnum.Basic:
        return 'bg-purple-100 text-purple-800'
      case SubscriptionPlanEnum.Pro:
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const activeSubscriptions = subscriptions.filter(sub => sub.isActive)
  const inactiveSubscriptions = subscriptions.filter(sub => !sub.isActive)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Subscription Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your subscriptions and view usage across all profiles
            </p>
          </div>

          {/* Active Subscriptions */}
          {activeSubscriptions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Active Subscriptions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPlanIcon(subscription.plan)}
                          <CardTitle className="text-lg">
                            {getPlanName(subscription.plan)} Plan
                          </CardTitle>
                        </div>
                        <Badge className={getPlanColor(subscription.plan)}>
                          Active
                        </Badge>
                      </div>
                      <CardDescription>
                        Profile ID: {subscription.profileId}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Posts per month</span>
                          <span>{subscription.quotaPostsPerMonth === -1 ? 'Unlimited' : subscription.quotaPostsPerMonth}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Storage</span>
                          <span>{subscription.quotaStorageGb}GB</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Start Date</span>
                          <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
                        </div>
                        {subscription.endDate && (
                          <div className="flex justify-between text-sm">
                            <span>End Date</span>
                            <span>{new Date(subscription.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => handleCancelSubscription(subscription.id)}
                          disabled={cancellingId === subscription.id}
                        >
                          {cancellingId === subscription.id ? 'Cancelling...' : 'Cancel Subscription'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Inactive Subscriptions */}
          {inactiveSubscriptions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Inactive Subscriptions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inactiveSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="opacity-75">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPlanIcon(subscription.plan)}
                          <CardTitle className="text-lg">
                            {getPlanName(subscription.plan)} Plan
                          </CardTitle>
                        </div>
                        <Badge variant="secondary">
                          Inactive
                        </Badge>
                      </div>
                      <CardDescription>
                        Profile ID: {subscription.profileId}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Ended</span>
                          <span>{new Date(subscription.endDate || subscription.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Subscriptions */}
          {subscriptions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <div className="mb-4">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Subscriptions Found</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any subscriptions yet. Create a profile to get started.
                </p>
                <Link href="/overview/profile/new">
                  <Button>Create New Profile</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Upgrade Options */}
          {activeSubscriptions.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Upgrade Your Plan
                </CardTitle>
                <CardDescription>
                  Need more features? Upgrade to a higher plan for additional capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/overview/profile/new" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Create New Profile
                    </Button>
                  </Link>
                  <Link href="/subscription/plans" className="flex-1">
                    <Button className="w-full">
                      View All Plans
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Support */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Need help with your subscription?{' '}
              <Link href="/support" className="text-primary hover:underline">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}