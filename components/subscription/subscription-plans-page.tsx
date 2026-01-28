'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Crown, Building2 } from 'lucide-react'
import { getPlanPricing, getPlanFeatures } from '@/lib/api/subscription'
import { SubscriptionPlanEnum } from '@/lib/types/subscription'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface SubscriptionPlansPageProps {
  onPlanSelect?: (plan: { id: number; name: string; price: number }) => void
  showCurrentPlan?: boolean
  profileId?: string
  isLoading?: boolean
}



export function SubscriptionPlansPage({
  onPlanSelect,
  showCurrentPlan = true,
  profileId,
  isLoading = false
}: SubscriptionPlansPageProps) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null)

  // Define plans based on backend enum
  const plans = [
    {
      id: SubscriptionPlanEnum.Free,
      name: 'Free',
      description: 'Dùng thử các tính năng cơ bản',
      price: 0,
      period: 'vĩnh viễn'
    },
    {
      id: SubscriptionPlanEnum.Basic,
      name: 'Plus',
      description: 'Nâng cấp với AI hỗ trợ',
      price: 359000,
      period: 'tháng',
      isPopular: true
    },
    {
      id: SubscriptionPlanEnum.Pro,
      name: 'Premium',
      description: 'Giải pháp tối ưu cho doanh nghiệp',
      price: 559000,
      period: 'tháng'
    }
  ]

  const handlePlanSelect = (plan: typeof plans[0]) => {
    if (isLoading) return

    if (onPlanSelect) {
      onPlanSelect({
        id: plan.id,
        name: plan.name,
        price: plan.price
      })
      return
    }

    // Navigate to checkout with plan and profile info
    const params = new URLSearchParams({
      planId: plan.id.toString(),
      planName: plan.name,
      price: plan.price.toString()
    })

    if (profileId) {
      params.set('profileId', profileId)
    }

    router.push(`/subscription/checkout?${params.toString()}`)
  }

  const getPlanIcon = (planId: number) => {
    switch (planId) {
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

  return (
    <div className="space-y-12 dark:text-slate-50">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-widest leading-tight">Chọn Gói Dịch Vụ Của Bạn</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-2xl mx-auto">
          Tối ưu hóa chiến lược marketing của bạn với sự hỗ trợ từ AI. Chuyển đổi hoặc hủy bất kỳ lúc nào.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {plans.map((plan) => {
          const features = getPlanFeatures(plan.id)
          const isSelected = selectedPlan === plan.id

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col transition-all duration-500 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-black/60 ${plan.isPopular
                ? 'ring-4 ring-primary/10 dark:ring-primary/5 shadow-2xl shadow-slate-200/50 dark:shadow-primary/20 scale-[1.05]'
                : 'hover:-translate-y-2'
                } ${isSelected ? 'ring-4 ring-primary/20' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-slate-900 dark:bg-primary text-white px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border-none shadow-xl">
                    Phổ Biến Nhất
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center p-10 pb-6">
                <div className="flex justify-center mb-8">
                  <div className={`size-20 rounded-3xl flex items-center justify-center transition-transform hover:scale-110 duration-500 ${plan.id === SubscriptionPlanEnum.Free ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                    plan.id === SubscriptionPlanEnum.Basic ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                      'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    }`}>
                    <div className="scale-125">{getPlanIcon(plan.id)}</div>
                  </div>
                </div>
                <CardTitle className="text-3xl dark:text-white font-black uppercase tracking-tight">{plan.name}</CardTitle>
                <CardDescription className="text-base font-bold mt-3 dark:text-slate-500 leading-relaxed px-4">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 p-10 pt-0 space-y-10">
                <div className="text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-5xl md:text-6xl font-black tracking-tighter dark:text-white">
                      {plan.price === 0 ? 'Miễn Phí' : formatCurrency(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-slate-400 dark:text-slate-500 text-sm font-black uppercase tracking-[0.2em]">thanh toán mỗi {plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-5 pt-10 border-t-2 border-slate-50 dark:border-slate-800">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full p-1 group-hover:bg-emerald-100 transition-colors">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-[15px] font-bold text-slate-600 dark:text-slate-300">
                      {features.posts === -1 ? 'Không giới hạn' : `${features.posts} bài đăng`} / tháng
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full p-1 group-hover:bg-emerald-100 transition-colors">
                      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-[15px] font-bold text-slate-600 dark:text-slate-300">
                      Tối đa {features.platforms} nền tảng & {features.accounts} tài khoản
                    </span>
                  </li>
                  {features.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="mt-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full p-1 group-hover:bg-emerald-100 transition-colors">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-[15px] font-bold text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-10 pt-0">
                <Button
                  disabled={isLoading}
                  className={`w-full h-14 rounded-2xl font-black uppercase tracking-[0.15em] text-[13px] transition-all duration-500 shadow-xl ${plan.isPopular
                    ? 'bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 shadow-slate-200/50 dark:shadow-primary/30 text-white'
                    : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border-none shadow-none'
                    }`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  {isLoading ? 'Đang xử lý...' : (plan.price === 0 ? 'Bắt đầu ngay' : 'Chọn gói này')}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="max-w-2xl mx-auto text-center space-y-6 pt-12">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold leading-relaxed">
          Không yêu cầu thẻ tín dụng cho gói Miễn Phí. Tất cả các gói trả phí đều đi kèm với sự hỗ trợ tận tâm từ đội ngũ kỹ thuật.
        </p>
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800">
          <Building2 className="h-4 w-4" />
          Cần giải pháp tùy chỉnh? <Link href="/contact" className="text-slate-900 dark:text-white hover:underline underline-offset-4">Liên hệ bộ phận doanh nghiệp</Link>
        </div>
      </div>
    </div>
  );
}
