'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Check, X, Zap, Crown, Building2 } from 'lucide-react'
import { useSubscriptionPlans, useChangePlan } from '@/hooks/use-subscription'
import { useSubscription } from '@/hooks/use-subscription'
import { formatPrice, calculateYearlySavings } from '@/lib/constants/subscription-plans'
import { toast } from 'sonner'
import type { SubscriptionPlan } from '@/lib/types/subscription'

interface SubscriptionPlansPageProps {
  onPlanSelect?: (plan: SubscriptionPlan) => void
  showCurrentPlan?: boolean
}

export function SubscriptionPlansPage({ 
  onPlanSelect, 
  showCurrentPlan = true 
}: SubscriptionPlansPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans()
  const { data: currentSubscription } = useSubscription()
  const changePlanMutation = useChangePlan()

  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    if (onPlanSelect) {
      onPlanSelect(plan)
      return
    }

    if (currentSubscription?.planId === plan.id) {
      toast.info('You are already on this plan')
      return
    }

    try {
      await changePlanMutation.mutateAsync({
        planId: plan.id,
        billingCycle,
        immediate: true,
      })
    } catch (error) {
      console.error('Plan change error:', error)
    }
  }

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Zap className="h-6 w-6 text-blue-500" />
      case 'pro':
        return <Crown className="h-6 w-6 text-purple-500" />
      case 'enterprise':
        return <Building2 className="h-6 w-6 text-orange-500" />
      default:
        return <Zap className="h-6 w-6 text-gray-500" />
    }
  }

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'border-blue-200 hover:border-blue-300'
      case 'pro':
        return 'border-purple-200 hover:border-purple-300'
      case 'enterprise':
        return 'border-orange-200 hover:border-orange-300'
      default:
        return 'border-gray-200 hover:border-gray-300'
    }
  }

  if (plansLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Choose Your Plan</h1>
          <p className="text-muted-foreground mt-2">
            Select the plan that best fits your needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!plans) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">Unable to load plans</h2>
        <p className="text-muted-foreground mt-2">
          Please try refreshing the page or contact support.
        </p>
      </div>
    )
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

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <Switch
          checked={billingCycle === 'yearly'}
          onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
        />
        <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
          Yearly
        </span>
        {billingCycle === 'yearly' && (
          <Badge variant="secondary" className="ml-2">
            Save 17%
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentSubscription?.planId === plan.id
          const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly
          const monthlyPrice = plan.price.monthly
          const yearlySavings = calculateYearlySavings(monthlyPrice, plan.price.yearly)

          return (
            <Card
              key={plan.id}
              className={`relative transition-all duration-200 ${getPlanColor(plan.tier)} ${
                plan.isPopular ? 'ring-2 ring-purple-500 shadow-lg scale-105' : ''
              } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {getPlanIcon(plan.tier)}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    {formatPrice(price)}
                  </span>
                  <span className="text-muted-foreground">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>

                {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                  <div className="text-sm text-green-600 mb-4">
                    Save {formatPrice(yearlySavings)} per year
                  </div>
                )}

                <ul className="space-y-2 text-left">
                  {plan.features.map((feature, index) => (
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
                  disabled={isCurrentPlan || changePlanMutation.isPending}
                >
                  {changePlanMutation.isPending ? (
                    'Processing...'
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : plan.price.monthly === 0 ? (
                    'Get Started'
                  ) : (
                    'Choose Plan'
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Additional Information */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          All plans include a 14-day free trial. No credit card required for the Free plan.
        </p>
        <p className="mt-1">
          Need help choosing? <a href="#" className="text-primary hover:underline">Contact our sales team</a>
        </p>
      </div>
    </div>
  )
}
