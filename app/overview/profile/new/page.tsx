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
    <div className="max-w-4xl mx-auto py-12 px-8 space-y-12 font-sans">
      {/* Header */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-12">
          <div className="space-y-6">
            <Link href="/overview" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Hủy bỏ hồ sơ
            </Link>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                {step === 1 ? "Thiết lập hồ sơ" : "Gói dịch vụ"}
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-xl">
                {step === 1
                  ? "Cung cấp các thông tin cơ bản để bắt đầu trải nghiệm omniadly."
                  : "Chọn một gói dịch vụ phù hợp để kích hoạt các tính năng AI mạnh nhất."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-2xl border border-slate-100">
            {[1, 2].map((i) => (
              <div
                key={i}
                onClick={() => i < step && handleBack()}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                  step === i ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
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
          <Card className="rounded-[3rem] border-slate-100 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3 group">
                  <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-slate-900 transition-colors">Tên Hồ Sơ</Label>
                  <Input
                    id="name"
                    placeholder="VD: Thương Hiệu ABC"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-12 bg-slate-50 border-none rounded-xl px-4 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all font-bold"
                  />
                  <p className="text-[10px] font-medium text-slate-400">Tên hiển thị chính mà bạn sẽ sử dụng trong ứng dụng.</p>
                </div>
                <div className="space-y-3 group">
                  <Label htmlFor="company" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-slate-900 transition-colors">Tên Doanh Nghiệp (Tùy chọn)</Label>
                  <Input
                    id="company"
                    placeholder="VD: Công ty TNHH ABC"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="h-12 bg-slate-50 border-none rounded-xl px-4 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all font-bold"
                  />
                  <p className="text-[10px] font-medium text-slate-400">Thông tin pháp nhân nếu bạn quản lý cho một tổ chức.</p>
                </div>
              </div>

              <div className="space-y-3 group">
                <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within:text-slate-900 transition-colors">Mô Tả Hồ Sơ</Label>
                <Textarea
                  id="bio"
                  placeholder="Giới thiệu đôi nét về định hướng hoặc mục tiêu của hồ sơ này..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="bg-slate-50 border-none rounded-2xl p-4 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all font-bold resize-none"
                />
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  onClick={handleNext}
                  disabled={!form.name.trim()}
                  className="h-12 px-10 rounded-xl font-black uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1"
                >
                  Tiếp tục chọn gói dịch vụ
                  <Plus className="h-4 w-4 ml-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card className="rounded-[3rem] border-slate-100 bg-white shadow-sm overflow-hidden">
              <CardContent className="p-4 sm:p-8">
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
                className="text-xs font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="size-3" />
                Quay lại chỉnh sửa thông tin
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trust Badge */}
      <div className="flex flex-col items-center gap-6 pt-12 pb-20">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
          <ShieldCheck className="size-4" />
          Bảo mật chuẩn mã hóa AES-256
        </div>
        <div className="flex items-center gap-8 grayscale opacity-20 group-hover:opacity-40 transition-opacity">
          <span className="text-sm font-black">VISA</span>
          <span className="text-sm font-black">MASTERCARD</span>
          <span className="text-sm font-black">STRIPE</span>
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
