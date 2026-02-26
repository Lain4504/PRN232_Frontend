'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import {
  Building2,
  Loader2,
  Check, Info, Crown, Zap, AlertTriangle
} from 'lucide-react'
import { useChangePlan, usePlanComparison } from '@/hooks/use-subscription'
import { formatPrice } from '@/lib/constants/subscription-plans'
import { analyzePlanChangeImpact } from '@/lib/utils/subscription'
import { toast } from 'sonner'
import type { SubscriptionPlan, BillingCycle, Subscription } from '@/lib/types/subscription'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'
import { createPayOSCheckoutLink } from '@/lib/api/subscription'

interface PlanChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetPlan: SubscriptionPlan
  currentSubscription?: Subscription
}

export function PlanChangeDialog({
  open,
  onOpenChange,
  targetPlan,
  currentSubscription
}: PlanChangeDialogProps) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [isMobile, setIsMobile] = useState(false)
  const changePlanMutation = useChangePlan()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    if (targetPlan.id === 'free') {
      try {
        await changePlanMutation.mutateAsync({
          planId: targetPlan.id,
          billingCycle: 'monthly',
          immediate: true,
        })
        onOpenChange(false)
      } catch {
        toast.error('Lỗi khi thay đổi gói dịch vụ')
      }
      return
    }

    // For paid plans, create PayOS checkout link
    try {
      setIsProcessing(true)
      const planEnumMap: Record<string, number> = {
        'basic': SubscriptionPlanEnum.Basic,
        'pro': SubscriptionPlanEnum.Pro
      }
      const planEnum = planEnumMap[targetPlan.id] ?? SubscriptionPlanEnum.Basic

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

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'pro': return <Crown className="size-4 text-purple-500" />
      case 'enterprise': return <Building2 className="size-4 text-orange-500" />
      default: return <Zap className="size-4 text-blue-500" />
    }
  }

  const getImpactAnalysis = () => {
    if (!currentSubscription) return null
    return analyzePlanChangeImpact(currentSubscription, targetPlan)
  }

  if (!targetPlan) return null

  const impactAnalysis = getImpactAnalysis()
  const price = billingCycle === 'yearly' ? targetPlan.price.yearly : targetPlan.price.monthly

  const renderContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Gói hiện tại</Label>
          <div className="p-3 rounded-md border bg-slate-50/50">
            <div className="flex items-center gap-2 mb-1">
              {getPlanIcon(currentSubscription?.tier || 'free')}
              <span className="text-sm font-semibold">{currentSubscription?.planName || 'Miễn phí'}</span>
            </div>
            <p className="text-xs text-slate-500">{formatPrice(0)}/tháng</p>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Gói mới chọn</Label>
          <div className="p-3 rounded-md border border-slate-900 bg-white">
            <div className="flex items-center gap-2 mb-1">
              {getPlanIcon(targetPlan.tier)}
              <span className="text-sm font-semibold">{targetPlan.name}</span>
            </div>
            <p className="text-xs text-slate-500">{formatPrice(price)}/{billingCycle === 'yearly' ? 'năm' : 'tháng'}</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-muted border">
        <div className="flex items-center gap-2 mb-1.5">
          <Info className="size-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Thông tin thanh toán</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
          Gói dịch vụ sẽ được kích hoạt ngay lập tức sau khi hoàn tất thanh toán qua PayOS. Hệ thống hiện chỉ hỗ trợ đăng ký theo tháng.
        </p>
      </div>

      {impactAnalysis && (impactAnalysis.warnings.length > 0 || impactAnalysis.immediateChanges.length > 0) && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Ảnh hưởng của thay đổi</Label>
          {impactAnalysis.warnings.map((warning, i) => (
            <Alert key={i} variant="destructive" className="py-2">
              <AlertTriangle className="size-4" />
              <AlertDescription className="text-xs">{warning}</AlertDescription>
            </Alert>
          ))}
          {impactAnalysis.immediateChanges.map((change, i) => (
            <Alert key={i} className="py-2">
              <Info className="size-4" />
              <AlertDescription className="text-xs">{change}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Các tính năng chính</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {targetPlan.features.slice(0, 6).map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="size-3 text-emerald-500" />
              <span className="text-xs text-slate-600">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const footerActions = (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={() => onOpenChange(false)} disabled={changePlanMutation.isPending}>
        Hủy
      </Button>
      <Button
        onClick={handleConfirm}
        disabled={changePlanMutation.isPending || isProcessing}
      >
        {changePlanMutation.isPending || isProcessing ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          `Xác nhận ${targetPlan.id === 'free' ? 'Thay đổi' : 'Thanh toán'}`
        )}
      </Button>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh] flex flex-col">
          <DrawerHeader className="border-b text-left">
            <DrawerTitle>Thay đổi gói dịch vụ</DrawerTitle>
            <DrawerDescription>Xem lại các thay đổi trước khi xác nhận nâng cấp.</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1 p-4">
            {renderContent()}
          </div>
          <DrawerFooter className="border-t p-4">
            {footerActions}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Thay đổi gói dịch vụ</DialogTitle>
          <DialogDescription>Xem lại các thay đổi và xác nhận gói dịch vụ mới của bạn.</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 p-6 scrollbar-hide">
          {renderContent()}
        </div>

        <DialogFooter className="p-6 border-t mt-0">
          {footerActions}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
