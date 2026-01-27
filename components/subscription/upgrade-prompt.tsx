'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Crown, Building2, Zap, ArrowRight, Star } from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'
import { useFeatureGate } from '@/hooks/use-feature-gate'
import Link from 'next/link'

interface UpgradePromptProps {
  featureId?: string
  requiredTier?: 'plus' | 'premium'
  title?: string
  description?: string
  showCurrentPlan?: boolean
  showBenefits?: boolean
  variant?: 'card' | 'alert' | 'inline'
  className?: string
}

export function UpgradePrompt({
  featureId,
  requiredTier,
  title,
  description,
  showCurrentPlan = true,
  showBenefits = true,
  variant = 'card',
  className = ''
}: UpgradePromptProps) {
  const { data: subscription } = useSubscription()
  const { featureGate } = useFeatureGate(featureId || '')

  // Determine the required tier
  const targetTier = requiredTier || (featureGate?.requiredTier === 'pro' ? 'premium' : 'plus')

  // Get upgrade prompt text
  const upgradeText = featureGate?.upgradePrompt ||
    `Nâng cấp lên gói ${targetTier === 'premium' ? 'Premium' : 'Plus'} để sử dụng tính năng này`

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Crown className="h-5 w-5 text-purple-500" />
      case 'plus':
        return <Star className="h-5 w-5 text-blue-500" />
      default:
        return <Zap className="h-5 w-5 text-gray-500" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'border-purple-200 bg-purple-50 dark:bg-purple-950/20'
      case 'plus':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
      default:
        return 'border-slate-200 bg-slate-50 dark:bg-slate-950/20'
    }
  }

  const getTierBenefits = (tier: string) => {
    switch (tier) {
      case 'plus':
        return [
          'AI tạo nội dung (2 bài/ngày)',
          'AI tạo hình ảnh (7 hình/ngày)',
          'Lên lịch đăng (30 bài/tháng)',
          'Tối đa 2 nền tảng & 3 tài khoản',
          'Phân tích hiệu quả quảng cáo'
        ]
      case 'premium':
        return [
          'AI tạo nội dung cao cấp (4 bài/ngày)',
          'AI tạo hình ảnh cao cấp (10 hình/ngày)',
          'Lên lịch đăng không giới hạn',
          'Tối đa 3 nền tảng & 5 tài khoản',
          'Phân tích chiến lược chuyên sâu'
        ]
      default:
        return []
    }
  }

  const benefits = getTierBenefits(targetTier)

  if (variant === 'alert') {
    return (
      <Alert className={`${getTierColor(targetTier)} ${className}`}>
        <div className="flex items-center space-x-2 w-full">
          {getTierIcon(targetTier)}
          <AlertDescription className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <span>{upgradeText}</span>
              <Button asChild size="sm" variant="outline">
                <Link href="/overview/subscription">
                  Nâng cấp
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </div>
      </Alert>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg border ${getTierColor(targetTier)} ${className}`}>
        <div className="flex items-center space-x-2">
          {getTierIcon(targetTier)}
          <span className="text-sm font-medium">{upgradeText}</span>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/overview/subscription">
            Nâng cấp
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>
    )
  }

  // Default card variant
  return (
    <Card className={`${getTierColor(targetTier)} ${className}`}>
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-2">
          <div className="p-2 rounded-full bg-background border shadow-sm">
            {getTierIcon(targetTier)}
          </div>
        </div>
        <CardTitle className="text-lg">
          {title || `Nâng cấp lên ${targetTier === 'premium' ? 'Premium' : 'Plus'}`}
        </CardTitle>
        <CardDescription className="text-xs">
          {description || upgradeText}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {showBenefits && benefits.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Quyền lợi:</h4>
            <ul className="space-y-1.5">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <Star className="h-3.5 w-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-tight">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-center">
          <Badge variant="outline" className="capitalize text-[10px] font-bold">
            {targetTier} Plan
          </Badge>
        </div>

        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/overview/subscription" className="flex items-center justify-center">
              Nâng cấp ngay
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {showCurrentPlan && subscription && (
          <div className="text-[10px] text-muted-foreground text-center font-medium">
            Gói hiện tại: <span className="text-foreground uppercase">{subscription.plan === 0 ? 'Free' : subscription.plan === 1 ? 'Plus' : 'Premium'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Specialized upgrade prompts for common scenarios
export function CampaignLimitPrompt({ className = '' }: { className?: string }) {
  return (
    <UpgradePrompt
      featureId="plus"
      title="Đã đạt giới hạn bài đăng"
      description="Bạn đã đạt giới hạn 5 bài đăng/tháng. Nâng cấp để đăng nhiều hơn."
      variant="alert"
      className={className}
    />
  )
}

export function TeamLimitPrompt({ className = '' }: { className?: string }) {
  return (
    <UpgradePrompt
      featureId="plus"
      title="Giới hạn tài khoản"
      description="Gói Free chỉ hỗ trợ 1 tài khoản. Nâng cấp để thêm nhiều hơn."
      variant="alert"
      className={className}
    />
  )
}

export function AnalyticsPrompt({ className = '' }: { className?: string }) {
  return (
    <UpgradePrompt
      featureId="premium"
      title="Phân tích chuyên sâu"
      description="Khám phá các đề xuất ngân sách và nội dung nâng cao với gói Premium."
      requiredTier="premium"
      variant="card"
      className={className}
    />
  )
}
