'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ArrowRight, Zap, Crown, Building2 } from 'lucide-react'
import { getSubscription } from '@/lib/api/subscription'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'
import Link from 'next/link'
import type { SubscriptionResponseDto } from '@/lib/types/subscription'

function SuccessContent() {
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<SubscriptionResponseDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const subscriptionId = searchParams.get('subscriptionId')

  useEffect(() => {
    if (subscriptionId && subscriptionId !== 'free') {
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
        return 'Plus'
      case SubscriptionPlanEnum.Pro:
        return 'Premium'
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
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">
              {isFreePlan ? 'Tạo hồ sơ thành công!' : 'Kích hoạt gói dịch vụ thành công!'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isFreePlan
                ? 'Hồ sơ miễn phí của bạn đã sẵn sàng. Bạn có thể nâng cấp bất cứ lúc nào.'
                : 'Gói dịch vụ của bạn đã được kích hoạt. Bạn có thể bắt đầu sử dụng tất cả tính năng ngay bây giờ.'}
            </p>
          </div>

          {subscription && (
            <Card className="mb-8 shadow-none border border-neutral-200/60 dark:border-neutral-800/60 rounded-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  {getPlanIcon(subscription.plan)}
                  Gói {getPlanName(subscription.plan)}
                </CardTitle>
                <CardDescription>Chi tiết đăng ký của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Trạng thái</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Đang hoạt động
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Ngày gia hạn tiếp theo</span>
                    <span className="text-muted-foreground">
                      {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Mã đăng ký</span>
                    <span className="text-muted-foreground font-mono text-sm">
                      {subscription.id}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-8 shadow-none border border-neutral-200/60 dark:border-neutral-800/60 rounded-md">
            <CardHeader>
              <CardTitle>Tiếp theo bạn nên làm gì?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Hoàn tất thiết lập hồ sơ</p>
                    <p className="text-sm text-muted-foreground">
                      Thêm thông tin doanh nghiệp và các tài khoản mạng xã hội của bạn
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Tạo nội dung đầu tiên</p>
                    <p className="text-sm text-muted-foreground">
                      Bắt đầu sáng tạo và lên lịch bài viết cho mạng xã hội của bạn
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Thiết lập chiến dịch đầu tiên</p>
                    <p className="text-sm text-muted-foreground">
                      Ra mắt chiến dịch quảng cáo đầu tiên để tiếp cận thêm nhiều khách hàng
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/overview">
              <Button size="lg" className="w-full sm:w-auto">
                Đi đến Bảng điều khiển
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            <p>
              Cần hỗ trợ bắt đầu?{' '}
              <Link href="/support" className="text-primary hover:underline">
                Liên hệ đội ngũ hỗ trợ của chúng tôi
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
