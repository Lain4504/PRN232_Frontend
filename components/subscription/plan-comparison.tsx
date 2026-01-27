'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Check, X, Zap, Crown, Building2 } from 'lucide-react'
import { useSubscriptionPlans, useChangePlan } from '@/hooks/use-subscription'
import { useSubscription } from '@/hooks/use-subscription'
import { formatPrice } from '@/lib/constants/subscription-plans'
import { toast } from 'sonner'
import type { SubscriptionPlan } from '@/lib/types/subscription'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    if (onPlanSelect) {
      onPlanSelect(plan)
      return
    }

    if (currentSubscription?.plan.toString() === plan.id) {
      toast.info(t('common.notifications.featureComingSoon')) // Or a better key if I had one
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
          <CardTitle>{t('common.subscription.comparison.title')}</CardTitle>
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
          <p className="text-muted-foreground">{t('common.subscription.comparison.unableToLoad')}</p>
        </CardContent>
      </Card>
    )
  }

  // Define comparison features
  const comparisonFeatures = [
    {
      category: t('common.subscription.comparison.categories.core'),
      features: [
        { name: t('common.subscription.comparison.featureNames.posts'), key: 'postsPerMonth' },
        { name: t('common.subscription.comparison.featureNames.aiContent'), key: 'aiContentPerDay' },
        { name: t('common.subscription.comparison.featureNames.aiImages'), key: 'aiImagesPerDay' },
        { name: t('common.subscription.comparison.featureNames.platforms'), key: 'platforms' },
        { name: t('common.subscription.comparison.featureNames.accounts'), key: 'accounts' },
        { name: t('common.subscription.comparison.featureNames.campaigns'), key: 'adCampaigns' },
      ]
    },
    {
      category: t('common.subscription.comparison.categories.analytics'),
      features: [
        { name: t('common.subscription.comparison.featureNames.basicAnalytics'), key: 'basic_analytics' },
        { name: t('common.subscription.comparison.featureNames.advancedAnalytics'), key: 'advanced_analytics' },
        { name: t('common.subscription.comparison.featureNames.customReports'), key: 'custom_reports' },
        { name: t('common.subscription.comparison.featureNames.exportData'), key: 'export_data' },
      ]
    },
    {
      category: t('common.subscription.comparison.categories.support'),
      features: [
        { name: t('common.subscription.comparison.featureNames.emailSupport'), key: 'email_support' },
        { name: t('common.subscription.comparison.featureNames.prioritySupport'), key: 'priority_support' },
        { name: t('common.subscription.comparison.featureNames.dedicatedSupport'), key: 'dedicated_support' },
        { name: t('common.subscription.comparison.featureNames.teamManagement'), key: 'team_management' },
        { name: t('common.subscription.comparison.featureNames.customIntegrations'), key: 'custom_integrations' },
        { name: t('common.subscription.comparison.featureNames.whiteLabel'), key: 'white_label' },
      ]
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{t('common.subscription.comparison.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">{t('common.subscription.comparison.features')}</TableHead>
                {plans.map((plan) => (
                  <TableHead key={plan.id} className="text-center min-w-[150px]">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex items-center space-x-2">
                        {getPlanIcon(plan.tier)}
                        {plan.name}
                        {plan.isPopular && (
                          <Badge variant="secondary" className="text-xs">
                            {t('common.subscription.comparison.popular')}
                          </Badge>
                        )}
                        {currentSubscription?.plan.toString() === plan.id && (
                          <Badge variant="outline" className="text-xs">
                            {t('common.subscription.comparison.current')}
                          </Badge>
                        )}
                      </div>
                      {showPricing && (
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {formatPrice(plan.price.monthly)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {t('common.subscription.comparison.perMonth')}
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
                        if (showLimits && ['postsPerMonth', 'aiContentPerDay', 'aiImagesPerDay', 'platforms', 'accounts', 'adCampaigns'].includes(feature.key)) {
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
            const isCurrentPlan = currentSubscription?.plan.toString() === plan.id

            return (
              <Button
                key={plan.id}
                variant={plan.isPopular ? 'default' : 'outline'}
                onClick={() => handlePlanSelect(plan)}
                disabled={isCurrentPlan || changePlanMutation.isPending}
                className="min-w-[120px]"
              >
                {changePlanMutation.isPending ? (
                  t('common.subscription.comparison.processing')
                ) : isCurrentPlan ? (
                  t('common.subscription.comparison.currentPlan')
                ) : plan.price.monthly === 0 ? (
                  t('common.subscription.comparison.getStarted')
                ) : (
                  t('common.subscription.comparison.choosePlan')
                )}
              </Button>
            )
          })}
        </div>

        {/* Additional Information */}
        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>
            {t('common.subscription.comparison.trialNotice')}
          </p>
          <p className="mt-1">
            {t('common.subscription.comparison.needHelp')}{' '}
            <Link href="/contact" className="text-primary hover:underline">
              {t('common.subscription.comparison.contactSales')}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
