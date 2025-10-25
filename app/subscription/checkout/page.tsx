'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import { PaymentForm } from '@/components/subscription/payment-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Check, Zap, Crown, Building2 } from 'lucide-react'
import { getPlanFeatures, formatCurrency } from '@/lib/stripe'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'
import Link from 'next/link'
import { useGetProfile } from '@/hooks/use-profiles'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const planId = parseInt(searchParams.get('planId') || '0')
  const planName = searchParams.get('planName') || 'Free'
  const price = parseFloat(searchParams.get('price') || '0')
  const profileId = searchParams.get('profileId') || ''

  const { data: profile, isLoading } = useGetProfile(profileId)

  useEffect(() => {
    // Validate required parameters
    if (!planId || !profileId) {
      router.push('/overview/profile/new')
      return
    }
  }, [planId, profileId, router])

  useEffect(() => {
    if (!isLoading && profile) {
      // Check if profile is in pending status
      if (profile.status !== 0) {
        toast.error('Profile is not in pending status')
        router.push('/overview/profile/new')
      }
    } else if (!isLoading && !profile) {
      toast.error('Profile not found')
      router.push('/overview/profile/new')
    }
  }, [profile, isLoading, router])

  const getPlanIcon = (planId: number) => {
    switch (planId) {
      case SubscriptionPlanEnum.Free:
        return <Zap className="h-6 w-6 text-blue-500" />
      case SubscriptionPlanEnum.Basic:
        return <Crown className="h-6 w-6 text-purple-500" />
      case SubscriptionPlanEnum.Pro:
        return <Building2 className="h-6 w-6 text-orange-500" />
      default:
        return <Zap className="h-6 w-6 text-gray-500" />
    }
  }

  const handlePaymentSuccess = (subscriptionId: string) => {
    router.push(`/subscription/success?subscriptionId=${subscriptionId}`)
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!planId || !profileId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Invalid checkout session</h2>
          <p className="text-muted-foreground mt-2">
            Please select a plan to continue.
          </p>
          <Link href="/overview/profile/new">
            <Button className="mt-4">Go Back</Button>
          </Link>
        </div>
      </div>
    )
  }

  const features = getPlanFeatures(planId)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/overview/profile/new">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile Creation
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Complete Your Subscription</h1>
            <p className="text-muted-foreground mt-2">
              You're almost ready to get started with your new profile.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getPlanIcon(planId)}
                    {planName} Plan
                  </CardTitle>
                  <CardDescription>
                    {price === 0 ? 'Free forever' : `Billed monthly`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Monthly Price</span>
                      <span className="text-2xl font-bold">
                        {price === 0 ? 'Free' : formatCurrency(price)}
                      </span>
                    </div>

                    {price > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <p>• Cancel anytime</p>
                        <p>• 14-day free trial</p>
                        <p>• Secure payment processing</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>What's Included</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>
                        {features.posts === -1 ? 'Unlimited' : features.posts} posts per month
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{features.storage}GB storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>
                        {features.campaigns === -1 ? 'Unlimited' : features.campaigns} ad campaigns
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{features.teamMembers} team members</span>
                    </li>
                    {features.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div>
              {price === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Free Plan</CardTitle>
                    <CardDescription>
                      No payment required for the Free plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      onClick={() => handlePaymentSuccess('free')}
                    >
                      Create Free Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Elements 
                  stripe={getStripe()} 
                  options={{
                    mode: 'payment',
                    currency: 'usd',
                    amount: Math.round(price * 100), // Convert to cents
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#2563eb',
                        colorBackground: '#ffffff',
                        colorText: '#1f2937',
                        colorDanger: '#dc2626',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        spacingUnit: '4px',
                        borderRadius: '8px',
                      },
                    },
                  }}
                >
                  <PaymentForm
                    planId={planId}
                    planName={planName}
                    price={price}
                    profileId={profileId}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              )}
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Your payment information is secure and encrypted. We use Stripe for secure payment processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
