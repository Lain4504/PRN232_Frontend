'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Check, X, AlertTriangle, Info, Crown, Building2, Zap } from 'lucide-react'
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

  // Detect mobile viewport
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
      toast.success('Plan changed successfully!')
    } catch (error) {
      console.error('Plan change error:', error)
      toast.error('Failed to change plan. Please try again.')
    }
  }

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Zap className="h-5 w-5 text-blue-500" />
      case 'pro':
        return <Crown className="h-5 w-5 text-purple-500" />
      case 'enterprise':
        return <Building2 className="h-5 w-5 text-orange-500" />
      default:
        return <Zap className="h-5 w-5 text-gray-500" />
    }
  }

  const getImpactAnalysis = () => {
    if (!currentSubscription) return null
    
    const currentPlan = {
      id: currentSubscription.plan.toString(),
      name: currentSubscription.planName,
      tier: currentSubscription.tier,
      price: { monthly: 0, yearly: 0 },
      features: currentSubscription.features,
      limits: currentSubscription.limits,
      billingCycle: 'monthly' as const,
      description: ''
    }

    return analyzePlanChangeImpact(currentSubscription, targetPlan)
  }

  // Guard against undefined targetPlan
  if (!targetPlan) {
    return null
  }

  const impactAnalysis = getImpactAnalysis()
  const price = billingCycle === 'yearly' ? targetPlan.price.yearly : targetPlan.price.monthly

  // Shared content component
  const renderContent = () => (
    <div className="space-y-6">
          {/* Plan Details */}
          <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}>
            <div className="space-y-2">
              <h4 className="font-medium">Current Plan</h4>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  {getPlanIcon(currentSubscription?.tier || 'free')}
                  <span className="font-medium">{currentSubscription?.planName || 'Free'}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatPrice(0)}/month
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">New Plan</h4>
              <div className="p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center space-x-2 mb-2">
                  {getPlanIcon(targetPlan.tier)}
                  <span className="font-medium">{targetPlan.name}</span>
                  {targetPlan.isPopular && (
                    <Badge variant="secondary" className="text-xs">Popular</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatPrice(price)}/{billingCycle === 'yearly' ? 'year' : 'month'}
                </div>
              </div>
            </div>
          </div>

          {/* Billing Cycle Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Billing Cycle</Label>
            <RadioGroup value={billingCycle} onValueChange={(value) => setBillingCycle(value as BillingCycle)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>Monthly</span>
                    <span className="font-medium">{formatPrice(targetPlan.price.monthly)}/month</span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yearly" id="yearly" />
                <Label htmlFor="yearly" className="flex-1">
                  <div className="flex items-center justify-between">
                    <span>Yearly</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatPrice(targetPlan.price.yearly)}/year</span>
                      <Badge variant="secondary" className="text-xs">Save 17%</Badge>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Change Timing */}
          <div className="space-y-3">
            <Label className="text-base font-medium">When to Apply Changes</Label>
            <RadioGroup value={immediate ? 'immediate' : 'end-of-period'} onValueChange={(value) => setImmediate(value === 'immediate')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="immediate" id="immediate" />
                <Label htmlFor="immediate" className="flex-1">
                  <div>
                    <div className="font-medium">Apply immediately</div>
                    <div className="text-sm text-muted-foreground">
                      Changes take effect right away. You&apos;ll be charged the prorated amount.
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="end-of-period" id="end-of-period" />
                <Label htmlFor="end-of-period" className="flex-1">
                  <div>
                    <div className="font-medium">Apply at end of billing period</div>
                    <div className="text-sm text-muted-foreground">
                      Changes take effect on your next billing date.
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Impact Analysis */}
          {impactAnalysis && (
            <div className="space-y-3">
              <h4 className="font-medium">Impact of This Change</h4>
              
              {impactAnalysis.immediateChanges.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">Immediate Changes:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {impactAnalysis.immediateChanges.map((change, index) => (
                        <li key={index} className="text-sm">{change}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {impactAnalysis.endOfPeriodChanges.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">End of Period Changes:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {impactAnalysis.endOfPeriodChanges.map((change, index) => (
                        <li key={index} className="text-sm">{change}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {impactAnalysis.warnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">Important Warnings:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {impactAnalysis.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Feature Comparison */}
          <div className="space-y-3">
            <h4 className="font-medium">What&apos;s Included</h4>
            <div className="grid grid-cols-1 gap-2">
              {targetPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
  )

  // Shared footer component
  const renderFooter = () => (
    <div className={cn("flex-col space-y-2 sm:flex-row sm:space-y-0", isMobile ? "flex" : "flex")}>
      <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
        Cancel
      </Button>
      <Button 
        onClick={handleConfirm}
        disabled={changePlanMutation.isPending}
        className="w-full sm:w-auto"
      >
        {changePlanMutation.isPending ? (
          'Processing...'
        ) : (
          `Confirm ${comparison?.data?.isUpgrade ? 'Upgrade' : 'Change'}`
        )}
      </Button>
    </div>
  )

  // Render drawer for mobile
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle className="flex items-center space-x-2">
              {getPlanIcon(targetPlan.tier)}
              <span>Change to {targetPlan.name} Plan</span>
            </DrawerTitle>
            <DrawerDescription>
              Review the changes and confirm your plan upgrade
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="overflow-y-auto flex-1 px-4 pb-4">
            {renderContent()}
          </div>

          <DrawerFooter className="border-t">
            {renderFooter()}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  // Render dialog for desktop
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getPlanIcon(targetPlan.tier)}
            <span>Change to {targetPlan.name} Plan</span>
          </DialogTitle>
          <DialogDescription>
            Review the changes and confirm your plan upgrade
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0 px-6">
          {renderContent()}
        </div>

        <DialogFooter className="flex-shrink-0 flex-col sm:flex-row space-y-2 sm:space-y-0 border-t pt-4 mt-4">
          {renderFooter()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
