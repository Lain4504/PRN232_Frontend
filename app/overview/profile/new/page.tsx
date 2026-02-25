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
    <div className="container max-w-3xl py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Link href="/overview" className="flex items-center gap-1 hover:text-foreground transition-colors text-sm font-medium">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {step === 1 ? "Thiết lập hồ sơ" : "Chọn gói dịch vụ"}
          </h1>
          <p className="text-muted-foreground max-w-lg">
            {step === 1
              ? "Cung cấp các thông tin cơ bản để bắt đầu trải nghiệm."
              : "Chọn một gói dịch vụ phù hợp để kích hoạt các tính năng AI."}
          </p>
        </div>

        <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", step >= 1 ? "bg-primary" : "bg-muted")} />
            <div className={cn("h-1 w-8 rounded-full", step >= 2 ? "bg-primary" : "bg-muted")} />
            <div className={cn("h-2 w-2 rounded-full", step >= 2 ? "bg-primary" : "bg-muted")} />
        </div>
      </div>

      {/* Step Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Điền thông tin chi tiết về hồ sơ làm việc của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên Hồ Sơ <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    placeholder="VD: Thương Hiệu ABC"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Tên hiển thị chính trong ứng dụng.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Tên Doanh Nghiệp (Tùy chọn)</Label>
                  <Input
                    id="company"
                    placeholder="VD: Công ty TNHH ABC"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Thông tin pháp nhân nếu có.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Mô Tả Hồ Sơ</Label>
                <Textarea
                  id="bio"
                  placeholder="Giới thiệu về định hướng hoặc mục tiêu..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button onClick={handleNext} disabled={!form.name.trim()}>
                Tiếp tục
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-6">
            <SubscriptionPlansPage
              onPlanSelect={handlePlanSelect}
              showCurrentPlan={false}
              isLoading={isSubmitting}
            />
            <div className="flex justify-center">
              <Button variant="ghost" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại chỉnh sửa
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Security Footer */}
      <div className="flex items-center justify-center gap-6 pt-8 text-xs text-muted-foreground opacity-60">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Bảo mật SSL
        </div>
        <span>VISA</span>
        <span>MASTERCARD</span>
        <span>NAPAS</span>
      </div>
    </div>
  )
}
