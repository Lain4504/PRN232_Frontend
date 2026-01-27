'use client'

import { useEffect, Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check, Zap, Crown, Building2 } from 'lucide-react'
import { getPlanFeatures, createSubscription, createPayOSCheckoutLink } from '@/lib/api/subscription'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'
import Link from 'next/link'
import { useGetProfile } from '@/hooks/use-profiles'
import { toast } from 'sonner'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const planIdStr = searchParams.get('planId') || '0'
  const planId = parseInt(planIdStr)
  const planName = searchParams.get('planName') || 'Free'
  const price = parseFloat(searchParams.get('price') || '0')
  const profileId = searchParams.get('profileId') || ''

  const { data: profile, isLoading } = useGetProfile(profileId)

  useEffect(() => {
    if (!profileId) {
      router.push('/overview/profile/new')
      return
    }
  }, [profileId, router])

  useEffect(() => {
    if (!isLoading && !profile) {
      toast.error('Không tìm thấy thông tin hồ sơ')
      router.push('/overview/profile/new')
    }
  }, [profile, isLoading, router])

  const getPlanIcon = (pId: number) => {
    switch (pId) {
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

  const handleCreateFreeProfile = async () => {
    try {
      setIsProcessing(true)
      await createSubscription({
        profileId,
        plan: SubscriptionPlanEnum.Free,
        isRecurring: false
      })
      toast.success('Hồ sơ miễn phí đã được tạo thành công!')
      router.push(`/subscription/success?plan=free&profileId=${profileId}`)
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo hồ sơ. Vui lòng thử lại.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayOSCheckout = async () => {
    try {
      setIsProcessing(true)
      const checkoutData = await createPayOSCheckoutLink(planId)
      if (checkoutData?.checkoutUrl) {
        window.location.href = checkoutData.checkoutUrl
      } else {
        toast.error('Không thể tạo liên kết thanh toán.')
      }
    } catch (error) {
      toast.error('Lỗi khi khởi tạo thanh toán PayOS.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const planFeatures = getPlanFeatures(planId)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 space-y-2">
          <Link href="/overview/profile/new">
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại tạo hồ sơ
            </Button>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Hoàn tất đăng ký gói dịch vụ</h1>
          <p className="text-xs text-muted-foreground">Bạn chỉ còn một bước nữa để bắt đầu sử dụng hồ sơ mới của mình.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="shadow-none border border-neutral-200/60 dark:border-neutral-800/60 rounded-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {getPlanIcon(planId)}
                  Gói {planName}
                </CardTitle>
                <CardDescription className="text-xs">
                  {price === 0 ? 'Miễn phí vĩnh viễn' : 'Thanh toán hàng tháng'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Giá gói</span>
                  <span className="text-xl font-bold">{price === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}</span>
                </div>
                {price > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    <p>• Thanh toán qua PayOS an toàn</p>
                    <p>• Hỗ trợ kỹ thuật 24/7</p>
                    <p>• Kích hoạt ngay sau khi thanh toán</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-none border border-neutral-200/60 dark:border-neutral-800/60 rounded-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Các tính năng bao gồm</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{planFeatures.posts === -1 ? 'Không giới hạn' : `${planFeatures.posts} bài đăng`} / tháng</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Tối đa {planFeatures.platforms} nền tảng & {planFeatures.accounts} tài khoản</span>
                  </li>
                  {planFeatures.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-none border border-neutral-200/60 dark:border-neutral-800/60 rounded-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{price === 0 ? 'Kích hoạt gói Miễn Phí' : 'Thanh toán qua PayOS'}</CardTitle>
                <CardDescription className="text-xs">
                  {price === 0 ? 'Không yêu cầu thanh toán cho gói này' : 'Bạn sẽ được chuyển hướng đến cổng thanh toán PayOS'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  className="w-full"
                  onClick={price === 0 ? handleCreateFreeProfile : handlePayOSCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Đang xử lý...' : price === 0 ? 'Tạo hồ sơ miễn phí' : 'Thanh toán ngay'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Thông tin thanh toán của bạn được bảo mật và mã hóa. Chúng tôi sử dụng PayOS để xử lý thanh toán an toàn.</p>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
