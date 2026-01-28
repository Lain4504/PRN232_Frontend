'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Check, Info, Crown, Building2, Zap, AlertTriangle, Loader2 } from 'lucide-react'
import { useChangePlan, usePlanComparison } from '@/hooks/use-subscription'
import { formatPrice } from '@/lib/constants/subscription-plans'
import { analyzePlanChangeImpact } from '@/lib/utils/subscription'
import { toast } from 'sonner'
import type { SubscriptionPlan, BillingCycle, Subscription } from '@/lib/types/subscription'
import { cn } from '@/lib/utils'

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
  const [immediate, setImmediate] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const changePlanMutation = useChangePlan()
  const comparison = usePlanComparison(targetPlan.id)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleConfirm = async () => {
    try {
      await changePlanMutation.mutateAsync({
        planId: targetPlan.id,
        billingCycle,
        immediate,
      })
      onOpenChange(false)
      toast.success('Đã thay đổi gói dịch vụ thành công')
    } catch (error) {
      toast.error('Lỗi khi thay đổi gói dịch vụ')
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

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Chu kỳ thanh toán</Label>
        <RadioGroup value={billingCycle} onValueChange={(value) => setBillingCycle(value as BillingCycle)} className="grid gap-2">
          <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-slate-50">
            <RadioGroupItem value="monthly" id="monthly" />
            <Label htmlFor="monthly" className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <span className="text-sm">Thanh toán hàng tháng</span>
                <span className="text-sm font-medium">{formatPrice(targetPlan.price.monthly)}</span>
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-slate-50">
            <RadioGroupItem value="yearly" id="yearly" />
            <Label htmlFor="yearly" className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm">Thanh toán hàng năm</span>
                  <Badge variant="secondary" className="ml-2 text-[10px] bg-emerald-50 text-emerald-600 border-none">Tiết kiệm 17%</Badge>
                </div>
                <span className="text-sm font-medium">{formatPrice(targetPlan.price.yearly)}</span>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Thời điểm áp dụng</Label>
        <RadioGroup value={immediate ? 'immediate' : 'end-of-period'} onValueChange={(value) => setImmediate(value === 'immediate')} className="grid gap-2">
          <div className="flex items-start space-x-2 rounded-md border p-3 cursor-pointer hover:bg-slate-50">
            <RadioGroupItem value="immediate" id="immediate" className="mt-1" />
            <Label htmlFor="immediate" className="flex-1 cursor-pointer">
              <div className="font-semibold text-sm">Áp dụng ngay lập tức</div>
              <p className="text-xs text-slate-500 mt-0.5">Bạn sẽ được trải nghiệm các tính năng mới ngay sau khi thanh toán phần chênh lệch.</p>
            </Label>
          </div>
          <div className="flex items-start space-x-2 rounded-md border p-3 cursor-pointer hover:bg-slate-50">
            <RadioGroupItem value="end-of-period" id="end-of-period" className="mt-1" />
            <Label htmlFor="end-of-period" className="flex-1 cursor-pointer">
              <div className="font-semibold text-sm">Áp dụng sau khi hết chu kỳ cũ</div>
              <p className="text-xs text-slate-500 mt-0.5">Sẽ thay đổi gói ở chu kỳ thanh toán tiếp theo.</p>
            </Label>
          </div>
        </RadioGroup>
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
        disabled={changePlanMutation.isPending}
      >
        {changePlanMutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          `Xác nhận ${comparison?.data?.isUpgrade ? 'Nâng cấp' : 'Thay đổi'}`
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
