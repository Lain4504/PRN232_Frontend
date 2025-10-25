'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  Calendar, 
  CreditCard, 
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { getSubscription, cancelSubscription } from '@/lib/api/subscription'
import { formatCurrency } from '@/lib/stripe'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CancelSubscriptionPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  const subscriptionId = searchParams.get('id')

  useEffect(() => {
    if (subscriptionId) {
      loadSubscription()
    } else {
      setIsLoading(false)
    }
  }, [subscriptionId])

  const loadSubscription = async () => {
    try {
      const data = await getSubscription(subscriptionId!)
      setSubscription(data)
    } catch (error) {
      console.error('Error loading subscription:', error)
      toast.error('Failed to load subscription details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!subscription) return

    setIsCancelling(true)
    try {
      await cancelSubscription(subscription.id)
      toast.success('Subscription cancelled successfully')
      router.push('/subscription')
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error('Failed to cancel subscription')
    } finally {
      setIsCancelling(false)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Subscription Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The subscription you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/subscription">
            <Button className="mt-4">Back to Subscriptions</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/subscription">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Subscriptions
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Cancel Subscription</h1>
            <p className="text-muted-foreground mt-2">
              Are you sure you want to cancel your subscription?
            </p>
          </div>

          {/* Current Subscription */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Plan</span>
                  <Badge variant="secondary">
                    {getPlanName(subscription.plan)} Plan
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Profile ID</span>
                  <span className="text-muted-foreground font-mono text-sm">
                    {subscription.profileId}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Start Date</span>
                  <span className="text-muted-foreground">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </span>
                </div>

                {subscription.endDate && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">End Date</span>
                    <span className="text-muted-foreground">
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="font-medium">Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Warning */}
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> Cancelling your subscription will immediately stop your access to premium features. 
              You will be moved to the Free plan and lose access to advanced features.
            </AlertDescription>
          </Alert>

          {/* What Happens Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What happens when you cancel?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Immediate access loss</p>
                    <p className="text-sm text-muted-foreground">
                      You'll lose access to premium features immediately
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Data retention</p>
                    <p className="text-sm text-muted-foreground">
                      Your data will be preserved but you won't be able to create new content
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Free plan access</p>
                    <p className="text-sm text-muted-foreground">
                      You'll still have access to basic features with the Free plan
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Easy reactivation</p>
                    <p className="text-sm text-muted-foreground">
                      You can reactivate your subscription anytime from your dashboard
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="destructive"
              size="lg"
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex-1"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel Subscription'}
            </Button>
            
            <Link href="/subscription" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Keep Subscription
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Need help?{' '}
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
