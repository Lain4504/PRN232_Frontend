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
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý gói dịch vụ</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý gói dịch vụ, thanh toán và cài đặt gói của bạn
        </p>
      </div>

      {/* Subscription Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(effectiveSubscription.status)}
              <span>Trạng thái gói dịch vụ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Trạng thái gói dịch vụ</span>
              <Badge className={getStatusColor(effectiveSubscription.status)}>
                {effectiveSubscription.status === 'active' ? "Đang hoạt động" :
                  effectiveSubscription.status === 'cancelled' ? "Đã hủy" :
                    effectiveSubscription.status === 'past_due' ? "Quá hạn" :
                      effectiveSubscription.status === 'trialing' ? "Dùng thử" :
                        effectiveSubscription.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Gói</span>
              <span className="font-medium">{effectiveSubscription.planName}</span>
            </div>

            {effectiveSubscription.currentPeriodEnd && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ngày kết thúc</span>
                <span className="font-medium">
                  {new Date(effectiveSubscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            )}

            {effectiveSubscription.currentPeriodStart && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ngày bắt đầu</span>
                <span className="font-medium">
                  {new Date(effectiveSubscription.currentPeriodStart).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>
              Quản lý gói dịch vụ của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => {
                const plan = getPlanById('pro')
                if (plan) {
                  handlePlanChange(plan)
                } else {
                  toast.error('Plan not found. Please try again.')
                }
              }}
              className="w-full justify-start"
              variant="outline"
            >
              <Settings className="h-4 w-4 mr-2" />
              Đổi gói
            </Button>

            {effectiveSubscription.tier !== 'free' && (
              <Button
                onClick={handleCancelClick}
                className="w-full justify-start text-red-600 hover:text-red-700"
                variant="outline"
                disabled={cancelSubscriptionMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {cancelSubscriptionMutation.isPending ? "Đang lưu..." : "Hủy gói dịch vụ"}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Hủy gói dịch vụ?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Bạn có chắc chắn muốn hủy gói dịch vụ không? Hành động này không thể hoàn tác.
              </p>
              <div className="bg-muted p-3 rounded-md space-y-2 text-sm">
                <p className="font-medium">Điều gì sẽ xảy ra:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Bạn sẽ mất quyền truy cập vào các tính năng cao cấp ngay lập tức</li>
                  <li>Gói dịch vụ của bạn sẽ bị hủy vào cuối chu kỳ thanh toán hiện tại</li>
                  <li>Bạn sẽ tự động được chuyển sang gói Miễn phí</li>
                  <li>Dữ liệu của bạn sẽ được giữ lại, nhưng bạn sẽ không thể tạo nội dung cao cấp mới</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Giữ gói dịch vụ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {cancelSubscriptionMutation.isPending ? "Đang lưu..." : "Có, hủy gói dịch vụ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
