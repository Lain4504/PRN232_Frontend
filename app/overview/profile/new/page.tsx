"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SubscriptionPlansPage } from "@/components/subscription/subscription-plans-page"
import { Building2, ArrowLeft, User, CreditCard, Sparkles, Plus } from "lucide-react"
import Link from "next/link"
import { useCreateProfile } from "@/hooks/use-profiles"
import { useUser } from "@/hooks/use-user"
import { CreateProfileForm } from "@/lib/types/omniadly-types"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function CreateProfilePage() {
  const router = useRouter()
  const { data: user } = useUser()
  const createProfile = useCreateProfile(user?.id || '')

  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    bio: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => {
    if (step === 1 && form.name.trim()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  const handlePlanSelect = async (plan: { id: number; name: string; price: number }) => {
    if (isSubmitting) return

    try {
      if (!user?.id) {
        toast.error('Vui lòng đăng nhập để tạo hồ sơ')
        return
      }

      setIsSubmitting(true)
      const profileData: CreateProfileForm = {
        name: form.name,
        profile_type: plan.name as 'Free' | 'Basic' | 'Pro',
        company_name: form.companyName || undefined,
        bio: form.bio || undefined
      }

      const profile = await createProfile.mutateAsync(profileData)

      const params = new URLSearchParams({
        planId: plan.id.toString(),
        planName: plan.name,
        price: plan.price.toString(),
        profileId: profile.id
      })

      router.push(`/subscription/checkout?${params.toString()}`)
    } catch (error) {
      console.error('Error creating profile:', error)
      toast.error('Không thể tạo hồ sơ. Vui lòng thử lại.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn(
      "mx-auto py-6 md:py-12 px-4 md:px-8 space-y-8 md:space-y-12 font-sans transition-all duration-500",
      step === 1 ? "max-w-4xl" : "max-w-7xl"
    )}>
      {/* Header */}
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6 md:pb-12">
          <div className="space-y-4 md:space-y-6 text-center md:text-left">
            <Link href="/overview" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors mx-auto md:mx-0">
              <ArrowLeft className="h-3.5 w-3.5" />
              Hủy bỏ hồ sơ
            </Link>
            <div className="space-y-2">
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {step === 1 ? "Thiết lập hồ sơ" : "Gói dịch vụ"}
              </h1>
              <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto md:mx-0">
                {step === 1
                  ? "Cung cấp các thông tin cơ bản để bắt đầu trải nghiệm omniadly."
                  : "Chọn một gói dịch vụ phù hợp để kích hoạt các tính năng AI."}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 md:gap-3 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800">
            {[1, 2].map((i) => (
              <div
                key={i}
                onClick={() => i < step && handleBack()}
                className={cn(
                  "px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  step === i
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
                )}
              >
                Bước {i}
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Step Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {step === 1 ? (
          <Card className="rounded-2xl md:rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <CardContent className="p-6 md:p-12 space-y-8 md:space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                <div className="space-y-2 md:space-y-3 group">
                  <Label htmlFor="name" className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">Tên Hồ Sơ</Label>
                  <Input
                    id="name"
                    placeholder="VD: Thương Hiệu ABC"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-10 md:h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all font-bold text-sm md:text-base text-slate-900 dark:text-white"
                  />
                  <p className="text-[9px] md:text-[10px] font-medium text-slate-400 dark:text-slate-500">Tên hiển thị chính mà bạn sẽ sử dụng trong ứng dụng.</p>
                </div>
                <div className="space-y-2 md:space-y-3 group">
                  <Label htmlFor="company" className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">Tên Doanh Nghiệp (Tùy chọn)</Label>
                  <Input
                    id="company"
                    placeholder="VD: Công ty TNHH ABC"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="h-10 md:h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all font-bold text-sm md:text-base text-slate-900 dark:text-white"
                  />
                  <p className="text-[9px] md:text-[10px] font-medium text-slate-400 dark:text-slate-500">Thông tin pháp nhân nếu bạn quản lý cho một tổ chức.</p>
                </div>
              </div>

              <div className="space-y-2 md:space-y-3 group">
                <Label htmlFor="bio" className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">Mô Tả Hồ Sơ</Label>
                <Textarea
                  id="bio"
                  placeholder="Giới thiệu đôi nét về định hướng hoặc mục tiêu của hồ sơ này..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl md:rounded-2xl p-4 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-800 transition-all font-bold resize-none text-sm md:text-base text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-4 md:pt-6">
                <Button
                  onClick={handleNext}
                  disabled={!form.name.trim()}
                  className="h-10 md:h-12 w-full md:w-auto md:px-10 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white shadow-2xl shadow-slate-200 dark:shadow-primary/20 transition-all hover:-translate-y-1"
                >
                  Kế tiếp
                  <Plus className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 md:space-y-8">
            <Card className="rounded-2xl md:rounded-3xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <CardContent className="p-4 md:p-8">
                <SubscriptionPlansPage
                  onPlanSelect={handlePlanSelect}
                  showCurrentPlan={false}
                  isLoading={isSubmitting}
                />
              </CardContent>
            </Card>

            <div className="text-center">
              <button
                onClick={handleBack}
                className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="size-3" />
                Quay lại chỉnh sửa
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Trust Badge */}
      <div className="flex flex-col items-center gap-6 pt-12 pb-20">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">
          <ShieldCheck className="size-4" />
          Bảo mật chuẩn mã hóa AES-256
        </div>
        <div className="flex items-center gap-8 grayscale opacity-20 dark:opacity-40 group-hover:opacity-40 dark:group-hover:opacity-60 transition-opacity">
          <span className="text-sm font-black dark:text-white">VISA</span>
          <span className="text-sm font-black dark:text-white">MASTERCARD</span>
          <span className="text-sm font-black dark:text-white">STRIPE</span>
        </div>
      </div>
    </div>
  )
}

function ShieldCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
