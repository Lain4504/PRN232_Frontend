'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown, Building2 } from 'lucide-react'
import { getPlanPricing, getPlanFeatures } from '@/lib/api/subscription'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, cn } from '@/lib/utils'

interface SubscriptionPlansPageProps {
  onPlanSelect?: (plan: { id: number; name: string; price: number }) => void
  showCurrentPlan?: boolean
  profileId?: string
  isLoading?: boolean
}

export function SubscriptionPlansPage({
  onPlanSelect,
  showCurrentPlan = true,
  profileId,
  isLoading = false
}: SubscriptionPlansPageProps) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)

  // Define plans based on backend enum
  const plans = [
    {
      id: SubscriptionPlanEnum.Free,
      name: 'Free',
      description: 'Dùng thử các tính năng cơ bản',
      price: 0,
      period: 'vĩnh viễn'
    },
    {
      id: SubscriptionPlanEnum.Basic,
      name: 'Plus',
      description: 'Nâng cấp với AI hỗ trợ',
      price: 359000,
      period: 'tháng',
      isPopular: true
    },
    {
      id: SubscriptionPlanEnum.Pro,
      name: 'Premium',
      description: 'Giải pháp tối ưu cho doanh nghiệp',
      price: 559000,
      period: 'tháng'
    }
  ]

  const handlePlanSelect = (plan: typeof plans[0]) => {
    if (isLoading) return

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

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Chọn gói dịch vụ của bạn</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tối ưu hóa chiến lược marketing của bạn với sự hỗ trợ từ AI. Chuyển đổi hoặc hủy bất kỳ lúc nào.
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
              className={cn(
                "relative flex flex-col",
                plan.isPopular && "border-primary shadow-lg",
                isSelected && "ring-2 ring-primary"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                    Phổ biến nhất
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-4">
                  <div className={cn(
                    "p-3 rounded-lg bg-muted",
                    plan.id === SubscriptionPlanEnum.Free && "bg-blue-500/10 text-blue-600",
                    plan.id === SubscriptionPlanEnum.Basic && "bg-purple-500/10 text-purple-600",
                    plan.id === SubscriptionPlanEnum.Pro && "bg-orange-500/10 text-orange-600"
                  )}>
                    {getPlanIcon(plan.id)}
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                <div className="text-center">
                  <span className="text-3xl font-bold">
                    {plan.price === 0 ? 'Miễn phí' : formatCurrency(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground text-sm ml-1">/ {plan.period}</span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      {features.posts === -1 ? 'Không giới hạn' : `${features.posts} bài đăng`} / tháng
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>
                      Tối đa {features.platforms} nền tảng & {features.accounts} tài khoản
                    </span>
                  </div>
                  {features.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="pt-4">
                <Button
                  disabled={isLoading}
                  className="w-full"
                  variant={plan.isPopular ? "default" : "outline"}
                  onClick={() => handlePlanSelect(plan)}
                >
                  {isLoading ? 'Đang xử lý...' : (plan.price === 0 ? 'Bắt đầu ngay' : 'Chọn gói này')}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Không yêu cầu thẻ tín dụng cho gói Miễn phí. Tất cả các gói trả phí đều đi kèm với sự hỗ trợ tận tâm.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>Cần giải pháp gói lớn?</span>
          <Link href="/contact" className="text-primary hover:underline">
            Liên hệ chúng tôi
          </Link>
        </div>
      </div>
    </div>
  );
}
