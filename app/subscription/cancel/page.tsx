'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertTriangle,
  Calendar,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { getSubscription, cancelSubscription } from '@/lib/api/subscription'
import { formatCurrency } from '@/lib/utils'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'
import { toast } from 'sonner'
import Link from 'next/link'
import type { SubscriptionResponseDto } from '@/lib/types/subscription'

function CancelSubscriptionContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionResponseDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  const subscriptionId = searchParams.get('id')

  useEffect(() => {
    async function loadSubscription() {
      if (subscriptionId) {
        try {
          const data = await getSubscription(subscriptionId)
          setSubscription(data)
        } catch (error) {
          console.error('Error loading subscription:', error)
          toast.error('Không thể tải thông tin đăng ký')
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }
    loadSubscription()
  }, [subscriptionId])

  const handleCancel = async () => {
    if (!subscription) return

    setIsCancelling(true)
    try {
      await cancelSubscription(subscription.id)
      toast.success('Hủy gói dịch vụ thành công')
      router.push('/dashboard/subscription')
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error('Không thể hủy gói dịch vụ')
    } finally {
      setIsCancelling(false)
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

  if (!subscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Không tìm thấy gói dịch vụ</h2>
          <p className="text-muted-foreground mt-2">
            Gói dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Link href="/dashboard/subscription">
            <Button className="mt-4">Quay lại trang Gói dịch vụ</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard/subscription">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại trang Gói dịch vụ
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Hủy gói dịch vụ</h1>
            <p className="text-muted-foreground mt-2">
              Bạn có chắc chắn muốn hủy gói dịch vụ hiện tại không?
            </p>
          </div>

          {/* Current Subscription */}
          <Card className="mb-8 shadow-none border border-neutral-200/60 dark:border-neutral-800/60 rounded-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Gói dịch vụ hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Gói</span>
                  <Badge variant="secondary">
                    Gói {getPlanName(subscription.plan)}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Mã hồ sơ</span>
                  <span className="text-muted-foreground font-mono text-sm">
                    {subscription.profileId}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Ngày bắt đầu</span>
                  <span className="text-muted-foreground">
                    {new Date(subscription.startDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {subscription.endDate && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Ngày kết thúc</span>
                    <span className="text-muted-foreground">
                      {new Date(subscription.endDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="font-medium">Trạng thái</span>
                  <Badge className="bg-green-100 text-green-800">
                    Đang hoạt động
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Warning */}
          <Alert className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Cảnh báo:</strong> Việc hủy gói dịch vụ sẽ ngay lập tức dừng quyền truy cập của bạn vào các tính năng cao cấp.
              Bạn sẽ được chuyển sang gói Miễn phí (Free) và mất quyền truy cập vào các công cụ nâng cao.
            </AlertDescription>
          </Alert>

          {/* What Happens Next */}
          <Card className="mb-8 shadow-none border border-neutral-200/60 dark:border-neutral-800/60 rounded-md">
            <CardHeader>
              <CardTitle>Chuyện gì sẽ xảy ra khi bạn hủy?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Mất quyền truy cập ngay lập tức</p>
                    <p className="text-sm text-muted-foreground">
                      Bạn sẽ mất quyền truy cập vào các tính năng cao cấp ngay sau khi hủy
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Lưu trữ dữ liệu</p>
                    <p className="text-sm text-muted-foreground">
                      Dữ liệu của bạn vẫn được giữ lại nhưng bạn sẽ không thể tạo nội dung mới vượt quá hạn mức
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Truy cập gói Miễn phí</p>
                    <p className="text-sm text-muted-foreground">
                      Bạn vẫn có thể sử dụng các tính năng cơ bản của gói Miễn phí
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Dễ dàng kích hoạt lại</p>
                    <p className="text-sm text-muted-foreground">
                      Bạn có thể kích hoạt lại gói dịch vụ bất kỳ lúc nào từ Bảng điều khiển
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="destructive"
              size="lg"
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex-1"
            >
              {isCancelling ? 'Đang thực hiện...' : 'Đúng, tôi muốn Hủy'}
            </Button>

            <Link href="/dashboard/subscription" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Giữ gói dịch vụ
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Cần trợ giúp?{' '}
              <Link href="/support" className="text-primary hover:underline">
                Liên hệ đội ngũ hỗ trợ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CancelSubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <CancelSubscriptionContent />
    </Suspense>
  )
}
