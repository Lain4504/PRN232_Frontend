'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown, Building2 } from 'lucide-react'
import { getPlanPricing, getPlanFeatures, getPlanDisplayName, getPlanColor } from '@/lib/stripe'
import { formatCurrency } from '@/lib/stripe'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SubscriptionPlansPageProps {
  onPlanSelect?: (plan: { id: number; name: string; price: number }) => void
  showCurrentPlan?: boolean
  profileId?: string
}

export function SubscriptionPlansPage({
  onPlanSelect,
  showCurrentPlan = true,
  profileId
}: SubscriptionPlansPageProps) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)

  // Define plans based on backend enum
  const plans = [
    {
      id: SubscriptionPlanEnum.Free,
      name: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      period: 'forever'
    },
    {
      id: SubscriptionPlanEnum.Basic,
      name: 'Basic',
      description: 'Great for small businesses',
      price: 29,
      period: 'month',
      isPopular: true
    },
    {
      id: SubscriptionPlanEnum.Pro,
      name: 'Pro',
      description: 'For growing businesses',
      price: 99,
      period: 'month'
    }
  ]

  const handlePlanSelect = (plan: typeof plans[0]) => {
    if (onPlanSelect) {
      onPlanSelect({
        id: plan.id,
        name: plan.name,
        price: plan.price
      })
      return
    }

    // Navigate to checkout with plan and profile info
    const params = new URLSearchParams({
      planId: plan.id.toString(),
      planName: plan.name,
      price: plan.price.toString()
    })

    if (profileId) {
      params.set('profileId', profileId)
    }

    router.push(`/subscription/checkout?${params.toString()}`)
  }

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

  const getPlanBorderColor = (planId: number) => {
    switch (planId) {
      case SubscriptionPlanEnum.Free:
        return 'border-blue-200 hover:border-blue-300'
      case SubscriptionPlanEnum.Basic:
        return 'border-purple-200 hover:border-purple-300'
      case SubscriptionPlanEnum.Pro:
        return 'border-orange-200 hover:border-orange-300'
      default:
        return 'border-gray-200 hover:border-gray-300'
    }
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Scale your AI marketing with a plan that fits your growth stage. Change or cancel anytime.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const features = getPlanFeatures(plan.id)
          const isSelected = selectedPlan === plan.id

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col transition-all duration-300 rounded-xl border-2 ${plan.isPopular
                ? 'border-primary shadow-xl shadow-primary/5 scale-[1.02]'
                : 'border-border shadow-sm hover:shadow-md'
                } ${isSelected ? 'ring-2 ring-primary/20' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center p-8 pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-lg ${plan.id === SubscriptionPlanEnum.Free ? 'bg-blue-50 text-blue-600' :
                    plan.id === SubscriptionPlanEnum.Basic ? 'bg-purple-50 text-purple-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                    {getPlanIcon(plan.id)}
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm font-medium mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 p-8 pt-0">
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold tracking-tight">
                      {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground font-medium">/{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-emerald-50 rounded-full p-0.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {features.posts === -1 ? 'Unlimited' : features.posts} posts per month
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-emerald-50 rounded-full p-0.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {features.storage}GB secure storage
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-emerald-50 rounded-full p-0.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {features.campaigns === -1 ? 'Unlimited' : features.campaigns} AI campaigns
                    </span>
                  </li>
                  {features.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 bg-emerald-50 rounded-full p-0.5">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-8 pt-0">
                <Button
                  className={`w-full h-11 rounded-lg font-bold transition-all ${plan.isPopular
                    ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
                    : 'bg-muted/50 hover:bg-muted font-semibold text-foreground border-none shadow-none'
                    }`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  {plan.price === 0 ? 'Start Free' : 'Choose Plan'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="max-w-2xl mx-auto text-center space-y-4 pt-8">
        <p className="text-sm text-muted-foreground font-medium">
          No credit card required for the Free plan. All paid tiers include a 14-day full free trial with premium assets enabled.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-full text-xs font-semibold text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          Need a custom solution? <Link href="/contact" className="text-primary hover:underline">Contact Enterprise Sales</Link>
        </div>
      </div>
    </div>
  );
}
