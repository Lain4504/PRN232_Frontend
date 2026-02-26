'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Zap, Crown, Building2, Calendar, CreditCard, Activity } from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import { useProfile } from '@/lib/contexts/profile-context'

import { getSubscriptionStatusColor, getSubscriptionStatusText, getDaysUntilBilling } from '@/lib/utils/subscription'
import { Subscription } from '@/lib/types/subscription'
import Link from 'next/link'


// Helper function to create fallback subscription from profile type
const createFallbackSubscription = (
  profileType: number,
  profileId?: string
): Subscription | null => {
  if (!profileId) return null

  const tierMap = ['free', 'basic', 'pro'] as const
  const tier = tierMap[profileType] || 'free'

  return {
    id: `profile-${profileId}`,
    profileId: profileId,
    plan: profileType,
    planName: tier.charAt(0).toUpperCase() + tier.slice(1),
    tier,
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
    features: [],
    limits: {
      postsPerMonth: profileType === 2 ? -1 : profileType === 1 ? 1000 : 100,
      aiContentPerDay: profileType === 2 ? -1 : profileType === 1 ? 50 : 10,
      aiImagesPerDay: profileType === 2 ? -1 : profileType === 1 ? 20 : 5,
      platforms: profileType === 2 ? -1 : profileType === 1 ? 5 : 2,
      accounts: profileType === 2 ? -1 : profileType === 1 ? 20 : 5,
      analysisLevel: profileType === 2 ? 3 : profileType === 1 ? 2 : 1,
      adBudgetMonthly: profileType === 2 ? -1 : profileType === 1 ? 50000000 : 5000000,
      adCampaigns: profileType === 2 ? -1 : profileType === 1 ? 15 : 3
    },
    usage: {
      postsThisMonth: 0,
      aiContentToday: 0,
      aiImagesToday: 0,
      platforms: 0,
      accounts: 0
    }
  }
}

interface CurrentPlanCardProps {
  showUsage?: boolean
  showActions?: boolean
  className?: string
}

export function CurrentPlanCard({
  showUsage = true,
  showActions = true,
  className = ''
}: CurrentPlanCardProps) {
  const { data: subscription, isLoading, error } = useSubscription()
  const { profileType, activeProfileId } = useProfile()


  // Create fallback subscription if API returns null but we have profile type
  const effectiveSubscription = subscription || createFallbackSubscription(profileType, activeProfileId || undefined)

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

  const getUsagePercentage = (used: number, limit: number | string) => {
    if (typeof limit === 'string') {
      const numericLimit = parseFloat(limit)
      return Math.min((used / numericLimit) * 100, 100)
    }
    if (limit === -1) return 0 // Unlimited
    return Math.min((used / limit) * 100, 100)
  }

  const formatUsage = (used: number, limit: number | string) => {
    if (typeof limit === 'string') {
      return `${used} / ${limit}`
    }
    if (limit === -1) return `${used} / Không giới hạn`
    return `${used} / ${limit}`
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !effectiveSubscription) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Không thể tải thông tin gói dịch vụ.</p>
        </CardContent>
      </Card>
    )
  }

  const statusColor = getSubscriptionStatusColor(effectiveSubscription.status)
  const statusText = getSubscriptionStatusText(effectiveSubscription.status)
  const daysUntilBilling = getDaysUntilBilling(effectiveSubscription)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getPlanIcon(effectiveSubscription.tier)}
            <div>
              <CardTitle className="text-lg">{effectiveSubscription.planName}</CardTitle>
              <CardDescription>
                {effectiveSubscription.billingCycle === 'yearly' ? 'Thanh toán hàng năm' : 'Thanh toán hàng tháng'}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={statusColor === 'green' ? 'default' : 'secondary'}
            className={`${statusColor === 'green' ? 'bg-green-100 text-green-800' :
              statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                statusColor === 'red' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
              }`}
          >
            {statusText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Billing Information */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Gia hạn tiếp theo</span>
            </div>
            <span className="font-medium">
              {new Date(effectiveSubscription.currentPeriodEnd).toLocaleDateString('vi-VN')}
            </span>
          </div>

          {daysUntilBilling > 0 && (
            <div className="text-sm text-muted-foreground">
              {daysUntilBilling} ngày còn lại
            </div>
          )}

          {effectiveSubscription.cancelAtPeriodEnd && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              Gói sẽ tự động hủy vào cuối chu kỳ
            </div>
          )}
        </div>

        {/* Usage Statistics */}
        {showUsage && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Hạn mức tháng này</h4>

            <div className="space-y-3">
              {/* Posts */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Bài đăng tối đa</span>
                  </div>
                  <span className="font-mono text-sm px-2 py-0.5 bg-muted rounded">
                    {formatUsage(effectiveSubscription.usage.postsThisMonth, effectiveSubscription.limits.postsPerMonth)}
                  </span>
                </div>
                <Progress
                  value={getUsagePercentage(effectiveSubscription.usage.postsThisMonth, effectiveSubscription.limits.postsPerMonth)}
                  className="h-2"
                />
              </div>

              {/* AI Content */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Nội dung AI / ngày</span>
                  </div>
                  <span className="font-mono text-sm">
                    {formatUsage(effectiveSubscription.usage.aiContentToday, effectiveSubscription.limits.aiContentPerDay)}
                  </span>
                </div>
                <Progress
                  value={getUsagePercentage(effectiveSubscription.usage.aiContentToday, effectiveSubscription.limits.aiContentPerDay)}
                  className="h-2"
                />
              </div>

              {/* AI Images */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Hình ảnh AI / ngày</span>
                  </div>
                  <span className="font-mono text-sm">
                    {formatUsage(effectiveSubscription.usage.aiImagesToday, effectiveSubscription.limits.aiImagesPerDay)}
                  </span>
                </div>
                <Progress
                  value={getUsagePercentage(effectiveSubscription.usage.aiImagesToday, effectiveSubscription.limits.aiImagesPerDay)}
                  className="h-2"
                />
              </div>

              {/* Platforms */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Nền tảng kết nối</span>
                  </div>
                  <span className="font-mono text-sm">
                    {formatUsage(effectiveSubscription.usage.platforms, effectiveSubscription.limits.platforms)}
                  </span>
                </div>
                <Progress
                  value={getUsagePercentage(effectiveSubscription.usage.platforms, effectiveSubscription.limits.platforms)}
                  className="h-2"
                />
              </div>

              {/* Accounts */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>Tài khoản MXH</span>
                  </div>
                  <span className="font-mono text-sm">
                    {formatUsage(effectiveSubscription.usage.accounts, effectiveSubscription.limits.accounts)}
                  </span>
                </div>
                <Progress
                  value={getUsagePercentage(effectiveSubscription.usage.accounts, effectiveSubscription.limits.accounts)}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex space-x-2 pt-4 border-t">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href="/subscription/plans">
                Thay đổi gói
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href="/subscription/billing">
                <CreditCard className="h-4 w-4 mr-2" />
                Thanh toán
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
