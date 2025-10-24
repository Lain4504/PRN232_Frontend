'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ArrowRight, Zap, Crown, Building2 } from 'lucide-react'
import { getSubscription } from '@/lib/api/subscription'
import { formatCurrency } from '@/lib/stripe'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'
import Link from 'next/link'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const subscriptionId = searchParams.get('subscriptionId')

  useEffect(() => {
    if (subscriptionId && subscriptionId !== 'free') {
      // Fetch subscription details
      getSubscription(subscriptionId)
        .then(setSubscription)
        .catch(console.error)
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [subscriptionId])

  const getPlanIcon = (plan: number) => {
    switch (plan) {
      case SubscriptionPlanEnum.Free:
        return <Zap className="h-8 w-8 text-blue-500" />
      case SubscriptionPlanEnum.Basic:
        return <Crown className="h-8 w-8 text-purple-500" />
      case SubscriptionPlanEnum.Pro:
        return <Building2 className="h-8 w-8 text-orange-500" />
      default:
        return <Zap className="h-8 w-8 text-gray-500" />
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

  const isFreePlan = subscriptionId === 'free' || !subscriptionId

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">
              {isFreePlan ? 'Profile Created Successfully!' : 'Subscription Activated!'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isFreePlan 
                ? 'Your free profile is ready to use. You can upgrade anytime.'
                : 'Your subscription is now active and you can start using all features.'
              }
            </p>
          </div>

          {/* Subscription Details */}
          {subscription && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  {getPlanIcon(subscription.plan)}
                  {getPlanName(subscription.plan)} Plan
                </CardTitle>
                <CardDescription>
                  Your subscription details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Status</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Next Billing Date</span>
                    <span className="text-muted-foreground">
                      {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subscription ID</span>
                    <span className="text-muted-foreground font-mono text-sm">
                      {subscription.id}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* What's Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Complete your profile setup</p>
                    <p className="text-sm text-muted-foreground">
                      Add your business information and social media accounts
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Create your first content</p>
                    <p className="text-sm text-muted-foreground">
                      Start creating and scheduling posts for your social media
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Set up your first campaign</p>
                    <p className="text-sm text-muted-foreground">
                      Launch your first advertising campaign to reach more customers
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            
            <Link href="/subscription">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Manage Subscription
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 text-sm text-muted-foreground">
            <p>
              Need help getting started?{' '}
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
