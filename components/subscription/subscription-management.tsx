'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Zap,
  ArrowUpCircle
} from 'lucide-react'
import { useSubscription, useCancelSubscription } from '@/hooks/use-subscription'
import { PlanChangeDialog } from './plan-change-dialog'
import { SUBSCRIPTION_PLANS } from '@/lib/constants/subscription-plans'
import { toast } from 'sonner'
import type { SubscriptionPlan, Subscription } from '@/lib/types/subscription'
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

  const effectiveProfileId = profileId || activeProfileId || undefined
  const { data: subscription, isLoading, refresh } = useSubscription(effectiveProfileId)
  const cancelSubscriptionMutation = useCancelSubscription()

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'past_due':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 'trialing':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-6 animate-pulse", className)}>
        <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!effectiveSubscription) {
    return (
      <div className={cn("text-center py-12", className)}>
        <h2 className="text-xl font-semibold">Không thể tải thông tin gói dịch vụ</h2>
        <p className="text-muted-foreground mt-2">
          Vui lòng thử lại sau.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-8 pb-10", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý gói dịch vụ</h2>
          <p className="text-muted-foreground">
            Quản lý gói dịch vụ, thanh toán và cài đặt gói của bạn.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Trạng thái gói
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <span className="text-sm font-medium text-muted-foreground">Trạng thái</span>
              <Badge variant="outline" className={cn("capitalize", getStatusColor(effectiveSubscription.status))}>
                {effectiveSubscription.status === 'active' ? "Đang hoạt động" :
                  effectiveSubscription.status === 'cancelled' ? "Đã hủy" :
                    effectiveSubscription.status === 'past_due' ? "Quá hạn" :
                      effectiveSubscription.status === 'trialing' ? "Dùng thử" :
                        effectiveSubscription.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <span className="text-sm font-medium text-muted-foreground">Gói hiện tại</span>
              <span className="font-semibold">{effectiveSubscription.planName}</span>
            </div>

            {effectiveSubscription.currentPeriodEnd && (
              <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-muted-foreground">Ngày kết thúc</span>
                <span className="font-medium">
                  {new Date(effectiveSubscription.currentPeriodEnd).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}

            {effectiveSubscription.currentPeriodStart && (
              <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <span className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</span>
                <span className="font-medium">
                  {new Date(effectiveSubscription.currentPeriodStart).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
            <CardDescription>
              Nâng cấp hoặc thay đổi gói dịch vụ của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {effectiveSubscription.tier !== 'free' && (
              <Button
                onClick={handleRenew}
                disabled={isProcessing}
                className="w-full justify-start"
                variant="default"
              >
                <Clock className="h-4 w-4 mr-2" />
                {isProcessing ? "Đang xử lý..." : "Gia hạn gói hiện tại"}
              </Button>
            )}

            <div className="grid gap-2">
              {SUBSCRIPTION_PLANS.filter(plan => {
                const tierOrder = { 'free': 0, 'basic': 1, 'pro': 2 }
                const currentTierOrder = tierOrder[effectiveSubscription.tier as keyof typeof tierOrder] ?? 0
                const targetTierOrder = tierOrder[plan.tier as keyof typeof tierOrder] ?? 0
                return targetTierOrder > currentTierOrder
              }).map(plan => (
                <Button
                  key={plan.id}
                  onClick={() => handlePlanChange(plan)}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <ArrowUpCircle className="h-4 w-4 mr-2 text-primary" />
                  Nâng cấp lên {plan.name}
                </Button>
              ))}
            </div>

            {effectiveSubscription.tier !== 'free' && (
              <Button
                onClick={handleCancelClick}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                variant="ghost"
                disabled={cancelSubscriptionMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {cancelSubscriptionMutation.isPending ? "Đang xử lý..." : "Hủy gói dịch vụ"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedPlan && effectiveSubscription && (
        <PlanChangeDialog
          open={showPlanChangeDialog}
          onOpenChange={setShowPlanChangeDialog}
          targetPlan={selectedPlan}
          currentSubscription={effectiveSubscription}
        />
      )}

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Hủy gói dịch vụ?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>
                Bạn có chắc chắn muốn hủy gói dịch vụ không? Hành động này không thể hoàn tác và sẽ ảnh hưởng trực tiếp đến khả năng truy cập của bạn.
              </p>
              <div className="bg-muted p-3 rounded-md text-xs space-y-1">
                <p className="font-semibold mb-1">Điều gì sẽ xảy ra:</p>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  <li>Mất quyền truy cập vào các tính năng cao cấp</li>
                  <li>Gói sẽ bị hủy vào cuối chu kỳ thanh toán hiện tại</li>
                  <li>Tự động chuyển về gói Miễn phí</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Giữ gói</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelSubscriptionMutation.isPending ? "Đang hủy..." : "Xác nhận hủy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
