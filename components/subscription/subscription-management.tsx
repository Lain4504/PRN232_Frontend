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
  Clock
} from 'lucide-react'
import { useSubscription, useCancelSubscription } from '@/hooks/use-subscription'
import { PlanChangeDialog } from './plan-change-dialog'
import { getPlanById } from '@/lib/constants/subscription-plans'
import { toast } from 'sonner'
import type { SubscriptionPlan, Subscription } from '@/lib/types/subscription'
import { useProfile } from '@/lib/contexts/profile-context'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'
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
  const { activeProfileId, profileType } = useProfile()

  // Use prop profileId if provided, otherwise use activeProfileId from context
  const effectiveProfileId = profileId || activeProfileId || undefined
  const { data: subscription, isLoading } = useSubscription(effectiveProfileId)
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
      toast.success('Subscription cancelled successfully')
      setShowCancelDialog(false)
    } catch (error) {
      console.error('Cancellation error:', error)
      toast.error('Failed to cancel subscription. Please try again.')
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-12 text-slate-900 dark:text-white transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Settings className="size-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Cài đặt hệ thống</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase">
            QUẢN LÝ GÓI DỊCH VỤ
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
            Quản lý gói dịch vụ, thanh toán và cài đặt gói của bạn để tối ưu hiệu suất.
          </p>
        </div>
      </div>

      {/* Subscription Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Subscription Status */}
        <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-black/40 overflow-hidden group transition-all duration-300">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center gap-4 text-xl font-black uppercase text-slate-900 dark:text-white">
              <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                {getStatusIcon(effectiveSubscription.status)}
              </div>
              TRẠNG THÁI GÓI DỊCH VỤ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Trạng thái</span>
              <Badge className={cn("rounded-lg px-3 py-1 font-black uppercase tracking-widest text-[9px] border-none shadow-sm", getStatusColor(effectiveSubscription.status))}>
                {effectiveSubscription.status === 'active' ? "Đang hoạt động" :
                  effectiveSubscription.status === 'cancelled' ? "Đã hủy" :
                    effectiveSubscription.status === 'past_due' ? "Quá hạn" :
                      effectiveSubscription.status === 'trialing' ? "Dùng thử" :
                        effectiveSubscription.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Gói hiện tại</span>
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{effectiveSubscription.planName}</span>
            </div>

            {effectiveSubscription.currentPeriodEnd && (
              <div className="flex items-center justify-between py-4 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ngày kết thúc</span>
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase">
                  {new Date(effectiveSubscription.currentPeriodEnd).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}

            {effectiveSubscription.currentPeriodStart && (
              <div className="flex items-center justify-between py-4">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Ngày bắt đầu</span>
                <span className="text-sm font-black text-slate-900 dark:text-white uppercase">
                  {new Date(effectiveSubscription.currentPeriodStart).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-black/40 overflow-hidden group transition-all duration-300">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black uppercase text-slate-900 dark:text-white">THAO TÁC NHANH</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Quản lý và cập nhật gói dịch vụ của bạn một cách nhanh chóng.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-4">
            <Button
              onClick={() => {
                const plan = getPlanById('pro')
                if (plan) {
                  handlePlanChange(plan)
                } else {
                  toast.error('Gói Pro không khả dụng. Vui lòng thử lại sau.')
                }
              }}
              className="h-14 w-full justify-start rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-black uppercase tracking-widest text-[10px] shadow-sm transition-all hover:-translate-y-1"
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-3 opacity-50" />
              Nâng cấp / Thay đổi gói
            </Button>

            {effectiveSubscription.tier !== 'free' && (
              <Button
                onClick={handleCancelClick}
                className="h-14 w-full justify-start rounded-2xl bg-white dark:bg-slate-900 text-rose-500 border border-slate-100 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-black uppercase tracking-widest text-[10px] shadow-sm transition-all hover:-translate-y-1"
                variant="outline"
                disabled={cancelSubscriptionMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-3 opacity-70" />
                {cancelSubscriptionMutation.isPending ? "ĐANG XỬ LÝ..." : "HỦY GÓI DỊCH VỤ"}
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
        <AlertDialogContent className="rounded-3xl border-slate-100 dark:border-slate-800 p-10 max-w-md shadow-2xl bg-white dark:bg-slate-900 transition-all duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex flex-col items-center gap-6 text-center">
              <div className="size-20 rounded-3xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-800 shadow-sm">
                <AlertTriangle className="size-10" />
              </div>
              <span className="text-3xl font-black uppercase text-slate-900 dark:text-white leading-tight">Hủy gói dịch vụ?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-6 pt-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center italic">
                Bạn có chắc chắn muốn hủy gói dịch vụ không? Hành động này không thể hoàn tác và sẽ ảnh hưởng trực tiếp đến khả năng truy cập của bạn.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl space-y-4 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Điều gì sẽ xảy ra:</p>
                <ul className="space-y-3">
                  {[
                    "Mất quyền truy cập vào các tính năng cao cấp ngay lập tức",
                    "Gói sẽ bị hủy vào cuối chu kỳ thanh toán hiện tại",
                    "Tự động chuyển về gói Miễn phí với giới hạn thấp hơn",
                    "Dữ liệu được giữ lại nhưng không thể tạo thêm nội dung cao cấp"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <div className="size-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 grid grid-cols-2 gap-4">
            <AlertDialogCancel className="rounded-xl h-12 font-black uppercase tracking-widest text-[10px] bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Giữ gói dịch vụ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending}
              className="bg-rose-500 text-white hover:bg-rose-600 rounded-xl h-12 font-black uppercase tracking-widest text-[10px] border-none shadow-lg shadow-rose-100 dark:shadow-none"
            >
              {cancelSubscriptionMutation.isPending ? "ĐANG HỦY..." : "XÁC NHẬN HỦY"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
