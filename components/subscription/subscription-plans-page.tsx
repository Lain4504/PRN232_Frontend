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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">
          Select the plan that best fits your needs. You can change or cancel anytime.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const features = getPlanFeatures(plan.id)
          const isSelected = selectedPlan === plan.id

          return (
            <Card
              key={plan.id}
              className={`relative transition-all duration-200 ${getPlanBorderColor(plan.id)} ${
                plan.isPopular ? 'ring-2 ring-purple-500 shadow-lg scale-105' : ''
              } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.id)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? 'Free' : formatCurrency(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">
                      /{plan.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-2 text-left">
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">
                      {features.posts === -1 ? 'Unlimited' : features.posts} posts per month
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">
                      {features.storage}GB storage
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">
                      {features.campaigns === -1 ? 'Unlimited' : features.campaigns} ad campaigns
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">
                      {features.teamMembers} team members
                    </span>
                  </li>
                  {features.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.isPopular ? 'default' : 'outline'}
                  onClick={() => handlePlanSelect(plan)}
                >
                  {plan.price === 0 ? 'Get Started' : 'Choose Plan'}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Additional Information */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          No credit card required for the Free plan. All paid plans include a 14-day free trial.
        </p>
        <p className="mt-1">
          Need help choosing? <a href="#" className="text-primary hover:underline">Contact our sales team</a>
        </p>
      </div>
    </div>
  )
}
