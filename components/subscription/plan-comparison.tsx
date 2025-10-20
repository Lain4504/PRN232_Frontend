'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Check, X, Zap, Crown, Building2 } from 'lucide-react'
import { useSubscriptionPlans, useChangePlan } from '@/hooks/use-subscription'
import { useSubscription } from '@/hooks/use-subscription'
import { formatPrice } from '@/lib/constants/subscription-plans'
import { toast } from 'sonner'
import type { SubscriptionPlan } from '@/lib/types/subscription'

interface PlanComparisonProps {
  onPlanSelect?: (plan: SubscriptionPlan) => void
  showPricing?: boolean
  showLimits?: boolean
}

export function PlanComparison({ 
  onPlanSelect, 
  showPricing = true,
  showLimits = true 
}: PlanComparisonProps) {
  const { data: plans, isLoading } = useSubscriptionPlans()
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
        billingCycle: 'monthly',
        immediate: true,
      })
    } catch (error) {
      console.error('Plan change error:', error)
    }
  }

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Zap className="h-5 w-5 text-blue-500" />
      case 'pro':
        return <Crown className="h-5 w-5 text-purple-500" />
      case 'enterprise':
        return <Building2 className="h-5 w-5 text-orange-500" />
      default:
        return <Zap className="h-5 w-5 text-gray-500" />
    }
  }

  const formatLimit = (limit: number | string) => {
    if (typeof limit === 'number') {
      return limit === -1 ? 'Unlimited' : limit.toString()
    }
    return limit
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!plans) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Unable to load plan comparison</p>
        </CardContent>
      </Card>
    )
  }

  // Define comparison features
  const comparisonFeatures = [
    {
      category: 'Core Features',
      features: [
        { name: 'Campaigns', key: 'campaigns' },
        { name: 'Ad Sets', key: 'adSets' },
        { name: 'Ads', key: 'ads' },
        { name: 'Team Members', key: 'teamMembers' },
        { name: 'Storage', key: 'storage' },
        { name: 'API Calls/Month', key: 'apiCalls' },
      ]
    },
    {
      category: 'Analytics & Reporting',
      features: [
        { name: 'Basic Analytics', key: 'basic_analytics' },
        { name: 'Advanced Analytics', key: 'advanced_analytics' },
        { name: 'Custom Reports', key: 'custom_reports' },
        { name: 'Export Data', key: 'export_data' },
      ]
    },
    {
      category: 'Support & Management',
      features: [
        { name: 'Email Support', key: 'email_support' },
        { name: 'Priority Support', key: 'priority_support' },
        { name: 'Dedicated Support', key: 'dedicated_support' },
        { name: 'Team Management', key: 'team_management' },
        { name: 'Custom Integrations', key: 'custom_integrations' },
        { name: 'White Label', key: 'white_label' },
      ]
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Plan Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Features</TableHead>
                {plans.map((plan) => (
                  <TableHead key={plan.id} className="text-center min-w-[150px]">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center space-x-2">
                        {getPlanIcon(plan.tier)}
                        <span className="font-semibold">{plan.name}</span>
                        {plan.isPopular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                        {currentSubscription?.planId === plan.id && (
                          <Badge variant="outline" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      {showPricing && (
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {formatPrice(plan.price.monthly)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            per month
                          </div>
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonFeatures.map((category) => (
                <React.Fragment key={category.category}>
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={plans.length + 1} className="font-semibold">
                      {category.category}
                    </TableCell>
                  </TableRow>
                  {category.features.map((feature) => (
                    <TableRow key={feature.key}>
                      <TableCell className="font-medium">
                        {feature.name}
                      </TableCell>
                      {plans.map((plan) => {
                        const hasFeature = plan.features.some(f => 
                          f.toLowerCase().includes(feature.name.toLowerCase()) ||
                          f.toLowerCase().includes(feature.key.toLowerCase())
                        )
                        
                        // For limits, show the actual value
                        if (showLimits && ['campaigns', 'adSets', 'ads', 'teamMembers', 'storage', 'apiCalls'].includes(feature.key)) {
                          const limit = plan.limits[feature.key as keyof typeof plan.limits]
                          return (
                            <TableCell key={plan.id} className="text-center">
                              <span className="font-mono text-sm">
                                {formatLimit(limit)}
                              </span>
                            </TableCell>
                          )
                        }

                        return (
                          <TableCell key={plan.id} className="text-center">
                            {hasFeature ? (
                              <Check className="h-4 w-4 text-green-500 mx-auto" />
                            ) : (
                              <X className="h-4 w-4 text-gray-400 mx-auto" />
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.planId === plan.id
            
            return (
              <Button
                key={plan.id}
                variant={plan.isPopular ? 'default' : 'outline'}
                onClick={() => handlePlanSelect(plan)}
                disabled={isCurrentPlan || changePlanMutation.isPending}
                className="min-w-[120px]"
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
            )
          })}
        </div>

        {/* Additional Information */}
        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>
            All plans include a 14-day free trial. No credit card required for the Free plan.
          </p>
          <p className="mt-1">
            Need help choosing? <a href="#" className="text-primary hover:underline">Contact our sales team</a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
