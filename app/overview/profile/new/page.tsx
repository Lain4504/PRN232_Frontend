"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SubscriptionPlansPage } from "@/components/subscription/subscription-plans-page"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
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
    <div className="container mx-auto max-w-3xl py-12 px-6 space-y-10 min-h-[80vh] flex flex-col justify-center">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-6">
        <div className="space-y-3">
          <div className="flex justify-center mb-4">
            <Link href="/overview" className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors bg-muted/50 px-3 py-1.5 rounded-full">
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại tổng quan
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {step === 1 ? "Thiết lập Hồ sơ" : "Chọn gói Dịch vụ"}
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto italic">
            {step === 1
              ? "Cung cấp các thông số cơ bản để khởi tạo danh tính truyền thông của bạn."
              : "Lựa chọn cấu hình tài nguyên phù hợp để tối ưu hóa hiệu suất làm việc."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn("h-1.5 w-1.5 rounded-full transition-all duration-300", step >= 1 ? "bg-primary scale-125" : "bg-muted")} />
          <div className={cn("h-1 w-12 rounded-full transition-all duration-300", step >= 2 ? "bg-primary" : "bg-muted")} />
          <div className={cn("h-1.5 w-1.5 rounded-full transition-all duration-300", step >= 2 ? "bg-primary scale-125" : "bg-muted")} />
        </div>
      </div>

      {/* Step Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {step === 1 ? (
          <Card className="border-border shadow-xl bg-card rounded-lg overflow-hidden">
            <CardHeader className="text-center pb-2 border-b border-border bg-muted/10">
              <CardTitle className="text-xl font-bold">Thông tin định danh</CardTitle>
              <CardDescription className="text-xs font-medium italic">
                Cập nhật các chỉ số cơ bản cho hồ sơ vận hành.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-sm font-semibold">Tên hồ sơ chiến lược <span className="text-destructive font-black">*</span></Label>
                  <Input
                    id="name"
                    placeholder="VD: Agency Alpha, Creator X..."
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-10 rounded-md border-border bg-muted/5 focus-visible:ring-primary shadow-sm"
                  />
                  <p className="text-[10px] font-medium text-muted-foreground italic">Định danh chính thức của bạn trên hệ thống.</p>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="company" className="text-sm font-semibold">Pháp nhân Doanh nghiệp (Tùy chọn)</Label>
                  <Input
                    id="company"
                    placeholder="VD: Công ty TNHH Giải pháp AI"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="h-10 rounded-md border-border bg-muted/5 focus-visible:ring-primary shadow-sm"
                  />
                  <p className="text-[10px] font-medium text-muted-foreground italic">Thông tin doanh nghiệp để đối soát chứng từ.</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="bio" className="text-sm font-semibold">Tuyên ngôn / Mô tả hồ sơ</Label>
                <Textarea
                  id="bio"
                  placeholder="Mô tả ngắn gọn về sứ mệnh hoặc mục tiêu phát ngôn của bạn..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="resize-none rounded-md border-border bg-muted/5 focus-visible:ring-primary shadow-sm leading-relaxed"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-8">
              <Button onClick={handleNext} disabled={!form.name.trim()} className="h-11 px-10 rounded-md font-bold text-sm shadow-md transition-all hover:scale-105">
                Tiếp tục thiết lập
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-10">
            <SubscriptionPlansPage
              onPlanSelect={handlePlanSelect}
              showCurrentPlan={false}
              isLoading={isSubmitting}
            />
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleBack} className="gap-2 h-10 px-6 rounded-md font-semibold text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Quay lại tinh chỉnh thông tin
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Security Footer */}
      <div className="flex flex-col items-center justify-center gap-4 pt-4 border-t border-border mt-6">
        <div className="flex items-center gap-8 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/50" />
            Mã hóa SSL 256-bit
          </div>
          <span>Visa</span>
          <span>Mastercard</span>
          <span>Napas</span>
        </div>
      </div>
    </div>
  )
}
