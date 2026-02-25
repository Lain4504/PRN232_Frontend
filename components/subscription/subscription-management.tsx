'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react'
import { useSubscription, useCancelSubscription } from '@/hooks/use-subscription'
import { PlanChangeDialog } from './plan-change-dialog'
import { getPlanById, SUBSCRIPTION_PLANS } from '@/lib/constants/subscription-plans'
import { toast } from 'sonner'
import type { SubscriptionPlan, Subscription } from '@/lib/types/subscription'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'
import { createPayOSCheckoutLink } from '@/lib/api/subscription'
import { useProfile } from '@/lib/contexts/profile-context'
import { cn } from "@/lib/utils"


interface SubscriptionManagementProps {
  className?: string
  profileId?: string
}

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

export function SubscriptionManagement({ className = '', profileId }: SubscriptionManagementProps) {
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { activeProfileId, profileType } = useProfile()

  // Use prop profileId if provided, otherwise use activeProfileId from context
  const effectiveProfileId = profileId || activeProfileId || undefined
  const { data: subscription, isLoading, refresh } = useSubscription(effectiveProfileId)
  const cancelSubscriptionMutation = useCancelSubscription()

  // Create fallback subscription if API returns null but we have profile type
  const effectiveSubscription = subscription || createFallbackSubscription(profileType, effectiveProfileId)

  const handlePlanChange = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setShowPlanChangeDialog(true)
  }

  const handleCancelClick = () => {
    setShowCancelDialog(true)
  }

  const handleCancelSubscription = async () => {
    if (!effectiveSubscription) return

    try {
      await cancelSubscriptionMutation.mutateAsync({
        subscriptionId: effectiveSubscription.id,
        reason: 'User requested cancellation'
      })
      toast.success('Gói dịch vụ đã được hủy thành công')
      setShowCancelDialog(false)
      refresh()
    } catch (error) {
      console.error('Cancellation error:', error)
      toast.error('Không thể hủy gói dịch vụ. Vui lòng thử lại.')
    }
  }

  const handleRenew = async () => {
    if (!effectiveSubscription || effectiveSubscription.tier === 'free') return

    try {
      setIsProcessing(true)
      const planEnum = effectiveSubscription.plan

      const checkoutData = await createPayOSCheckoutLink(planEnum)
      if (checkoutData?.checkoutUrl) {
        window.location.href = checkoutData.checkoutUrl
      } else {
        toast.error('Không thể tạo liên kết thanh toán.')
      }
    } catch (error) {
      console.error('PayOS error:', error)
      toast.error('Lỗi khi khởi tạo thanh toán PayOS.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'past_due':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'trialing':
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      case 'trialing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!effectiveSubscription) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <h2 className="text-2xl font-semibold">Không thể tải thông tin gói dịch vụ</h2>
        <p className="text-muted-foreground mt-2">
          Không thể tải thông tin gói dịch vụ
        </p>
      </div>
    )
  }


  return (
    <div className={`space-y-12 pb-20 font-sans ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-muted flex items-center justify-center text-muted-foreground">
              <Settings className="size-3" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cài đặt hệ thống</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">
            Quản lý gói dịch vụ
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl">
            Quản lý gói dịch vụ, thanh toán và cài đặt gói của bạn để tối ưu hiệu suất.
          </p>
        </div>
      </div>

      {/* Subscription Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Subscription Status */}
        <Card className="rounded-lg border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="flex items-center gap-3 text-lg font-bold uppercase">
              <div className="size-8 rounded bg-muted flex items-center justify-center text-muted-foreground">
                <Zap className="size-4" /> {/* Icon replaced to match Zap usage elsewhere */}
              </div>
              Trạng thái gói
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trạng thái</span>
              <Badge variant="secondary" className={cn("rounded-full px-2 py-0.5 font-bold uppercase text-[9px]", getStatusColor(effectiveSubscription.status))}>
                {effectiveSubscription.status === 'active' ? "Đang hoạt động" :
                  effectiveSubscription.status === 'cancelled' ? "Đã hủy" :
                    effectiveSubscription.status === 'past_due' ? "Quá hạn" :
                      effectiveSubscription.status === 'trialing' ? "Dùng thử" :
                        effectiveSubscription.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gói hiện tại</span>
              <span className="text-xs font-bold uppercase">{effectiveSubscription.planName}</span>
            </div>

            {effectiveSubscription.currentPeriodEnd && (
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ngày kết thúc</span>
                <span className="text-xs font-semibold uppercase">
                  {new Date(effectiveSubscription.currentPeriodEnd).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}

            {effectiveSubscription.currentPeriodStart && (
              <div className="flex items-center justify-between py-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ngày bắt đầu</span>
                <span className="text-xs font-semibold uppercase">
                  {new Date(effectiveSubscription.currentPeriodStart).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-lg border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg font-bold uppercase">Thao tác nhanh</CardTitle>
            <CardDescription className="text-xs">
              Quản lý và cập nhật gói dịch vụ của bạn một cách nhanh chóng.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-3">
            {effectiveSubscription.tier !== 'free' && (
              <Button
                onClick={handleRenew}
                disabled={isProcessing}
                className="w-full justify-start rounded-md h-10 font-bold uppercase tracking-wider text-[10px]"
              >
                <Clock className="size-3.5 mr-2" />
                {isProcessing ? "Đang xử lý..." : "Gia hạn gói hiện tại"}
              </Button>
            )}

            <div className="grid grid-cols-1 gap-2">
              {SUBSCRIPTION_PLANS.filter(plan => {
                const tierOrder = { 'free': 0, 'basic': 1, 'pro': 2 }
                const currentTierOrder = tierOrder[effectiveSubscription.tier as keyof typeof tierOrder] ?? 0
                const targetTierOrder = tierOrder[plan.tier as keyof typeof tierOrder] ?? 0
                return targetTierOrder > currentTierOrder
              }).map(plan => (
                <Button
                  key={plan.id}
                  onClick={() => handlePlanChange(plan)}
                  className="w-full justify-start rounded-md h-10 font-bold uppercase tracking-wider text-[10px]"
                  variant="outline"
                >
                  <Zap className="size-3.5 mr-2 text-primary" />
                  Nâng cấp lên {plan.name}
                </Button>
              ))}
            </div>

            {effectiveSubscription.tier !== 'free' && (
              <Button
                onClick={handleCancelClick}
                className="w-full justify-start rounded-md h-10 font-bold uppercase tracking-wider text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                variant="outline"
                disabled={cancelSubscriptionMutation.isPending}
              >
                <XCircle className="size-3.5 mr-2" />
                {cancelSubscriptionMutation.isPending ? "Đang xử lý..." : "Hủy gói dịch vụ"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Change Dialog */}
      {selectedPlan && effectiveSubscription && (
        <PlanChangeDialog
          open={showPlanChangeDialog}
          onOpenChange={setShowPlanChangeDialog}
          targetPlan={selectedPlan}
          currentSubscription={effectiveSubscription}
        />
      )}

      {/* Cancel Subscription Alert Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="rounded-lg max-w-md p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex flex-col items-center gap-4 text-center">
              <div className="size-12 rounded bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
                <AlertTriangle className="size-6" />
              </div>
              <span className="text-xl font-bold uppercase">Hủy gói dịch vụ?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-2">
              <p className="text-sm font-medium text-muted-foreground text-center italic">
                Bạn có chắc chắn muốn hủy gói dịch vụ không? Hành động này không thể hoàn tác và sẽ ảnh hưởng trực tiếp đến khả năng truy cập của bạn.
              </p>
              <div className="bg-muted/50 p-4 rounded-md space-y-3 border">
                <p className="text-[10px] font-bold uppercase tracking-widest">Điều gì sẽ xảy ra:</p>
                <ul className="space-y-2">
                  {[
                    "Mất quyền truy cập vào các tính năng cao cấp ngay lập tức",
                    "Gói sẽ bị hủy vào cuối chu kỳ thanh toán hiện tại",
                    "Tự động chuyển về gói Miễn phí với giới hạn thấp hơn",
                    "Dữ liệu được giữ lại nhưng không thể tạo thêm nội dung cao cấp"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <div className="size-1 rounded-full bg-destructive mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="rounded-md h-9 font-bold uppercase tracking-widest text-[10px]">Giữ gói</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md h-9 font-bold uppercase tracking-widest text-[10px]"
            >
              {cancelSubscriptionMutation.isPending ? "Đang hủy..." : "Xác nhận hủy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
