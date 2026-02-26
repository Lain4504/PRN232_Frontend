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
  AlertTriangle,
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
      toast.success('Gói đăng ký đã được hủy thành công')
      setShowCancelDialog(false)
      refresh()
    } catch (error) {
      console.error('Cancellation error:', error)
      toast.error('Không thể hủy gói đăng ký. Vui lòng thử lại.')
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
        return 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'
      case 'cancelled':
        return 'bg-destructive/5 text-destructive border-destructive/10'
      case 'past_due':
        return 'bg-amber-500/5 text-amber-600 border-amber-500/10'
      case 'trialing':
        return 'bg-blue-500/5 text-blue-600 border-blue-500/10'
      default:
        return 'bg-muted/50 text-muted-foreground border-border'
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
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-border/50 pb-6">
        <div className="space-y-1.5">
          <Badge variant="outline" className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-primary/5 text-primary border-primary/20">
            Thanh toán & Gói dịch vụ • Billing & Plans
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight italic uppercase">Quản lý Tài khoản</h2>
          <p className="text-sm text-muted-foreground italic font-medium">
            Quản lý chu kỳ thanh toán và các quyền lợi của tài khoản.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-lg border border-border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-4 bg-muted/20 border-b border-border/50">
            <CardTitle className="text-sm font-bold uppercase tracking-wider italic flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Thông tin gói hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">Trạng thái</span>
              <Badge variant="outline" className={cn("px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-md", getStatusColor(effectiveSubscription.status))}>
                {effectiveSubscription.status === 'active' ? "Đang hoạt động" :
                  effectiveSubscription.status === 'cancelled' ? "Đã hủy" :
                    effectiveSubscription.status === 'past_due' ? "Quá hạn" :
                      effectiveSubscription.status === 'trialing' ? "Dùng thử" :
                        effectiveSubscription.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">Gói dịch vụ</span>
              <span className="text-sm font-bold italic uppercase tracking-tight">{effectiveSubscription.planName}</span>
            </div>

            {effectiveSubscription.currentPeriodEnd && (
              <div className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">Ngày hết hạn</span>
                <span className="text-xs font-bold font-mono text-foreground/80">
                  {new Date(effectiveSubscription.currentPeriodEnd).toLocaleDateString('vi-VN').replace(/\//g, ' • ')}
                </span>
              </div>
            )}

            {effectiveSubscription.currentPeriodStart && (
              <div className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">Ngày kích hoạt</span>
                <span className="text-xs font-bold font-mono text-foreground/80">
                  {new Date(effectiveSubscription.currentPeriodStart).toLocaleDateString('vi-VN').replace(/\//g, ' • ')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg border border-border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-4 bg-muted/20 border-b border-border/50">
            <CardTitle className="text-sm font-bold uppercase tracking-wider italic">Thay đổi gói dịch vụ</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">
              Nâng cấp hoặc thay đổi các quyền lợi tài khoản.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {effectiveSubscription.tier !== 'free' && (
              <Button
                onClick={handleRenew}
                disabled={isProcessing}
                className="w-full h-11 justify-start rounded-md font-bold text-[11px] uppercase tracking-widest px-4 shadow-sm"
                variant="default"
              >
                <Clock className="h-4 w-4 mr-3" />
                {isProcessing ? "Đang xử lý..." : "Gia hạn gói dịch vụ"}
              </Button>
            )}

            <div className="grid gap-3">
              {SUBSCRIPTION_PLANS.filter(plan => {
                const tierOrder = { 'free': 0, 'basic': 1, 'pro': 2 }
                const currentTierOrder = tierOrder[effectiveSubscription.tier as keyof typeof tierOrder] ?? 0
                const targetTierOrder = tierOrder[plan.tier as keyof typeof tierOrder] ?? 0
                return targetTierOrder > currentTierOrder
              }).map(plan => (
                <Button
                  key={plan.id}
                  onClick={() => handlePlanChange(plan)}
                  className="w-full h-11 justify-start rounded-md font-bold text-[11px] uppercase tracking-widest px-4 border-border/50 hover:bg-muted/50"
                  variant="outline"
                >
                  <ArrowUpCircle className="h-4 w-4 mr-3 text-primary" />
                  Nâng cấp lên {plan.name}
                </Button>
              ))}
            </div>

            {effectiveSubscription.tier !== 'free' && (
              <Button
                onClick={handleCancelClick}
                className="w-full h-11 justify-start rounded-md font-bold text-[11px] uppercase tracking-widest px-4 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                variant="ghost"
                disabled={cancelSubscriptionMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-3" />
                {cancelSubscriptionMutation.isPending ? "Đang xử lý..." : "Hủy gói đăng ký"}
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
        <AlertDialogContent className="rounded-lg border-border bg-popover p-8 max-w-md shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-destructive text-xl font-bold italic uppercase tracking-tight">
              <AlertTriangle className="h-6 w-6" />
              Xác nhận hủy đăng ký?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <p className="text-sm italic font-medium leading-relaxed">
                Bạn có chắc chắn muốn hủy gói đăng ký không? Hành động này sẽ <span className="text-destructive font-bold underline">vô hiệu hóa</span> các quyền lợi nâng cao của bạn.
              </p>
              <div className="bg-muted/30 p-4 rounded-md border border-border/50 text-xs space-y-2">
                <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Hệ quả sau khi hủy:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 italic font-medium">
                    <div className="size-1 rounded-full bg-destructive/40" />
                    Mất quyền truy cập các công cụ AI nâng cao
                  </li>
                  <li className="flex items-center gap-2 italic font-medium">
                    <div className="size-1 rounded-full bg-destructive/40" />
                    Bị giới hạn hạn mức tạo nội dung
                  </li>
                  <li className="flex items-center gap-2 italic font-medium">
                    <div className="size-1 rounded-full bg-destructive/40" />
                    Tài khoản trở về gói Miễn phí
                  </li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-md font-bold text-xs uppercase tracking-wider">Tiếp tục sử dụng</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md font-bold text-xs uppercase tracking-wider shadow-md"
            >
              {cancelSubscriptionMutation.isPending ? "Đang xử lý..." : "Xác nhận hủy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
