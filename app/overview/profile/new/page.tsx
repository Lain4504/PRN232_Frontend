"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SubscriptionPlansPage } from "@/components/subscription/subscription-plans-page"
import { Building2, ArrowLeft, CheckCircle, User, CreditCard } from "lucide-react"
import Link from "next/link"
import { useCreateProfile } from "@/hooks/use-profiles"
import { useUser } from "@/hooks/use-user"
import { CreateProfileForm } from "@/lib/types/aisam-types"
import { toast } from "sonner"

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
        bio: form.bio || undefined,
        avatar: undefined, // Optional
        avatarUrl: undefined // Optional
      }

      const profile = await createProfile.mutateAsync(profileData)

      // Redirect to checkout with real profile ID
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
    <div className="min-h-screen bg-background font-fira-sans">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Tạo Hồ Sơ Mới</h1>
            {step === 1 ? (
              <Link href="/overview">
                <Button variant="ghost" className="h-10 px-4 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Hủy Bỏ
                </Button>
              </Link>
            ) : (
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isSubmitting}
                className="h-10 px-4 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay Lại
              </Button>
            )}
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full flex-1 transition-all duration-500 ease-in-out ${step >= i ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 ? (
          <Card className="rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="p-8 border-b border-border/50 bg-muted/5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                  <User className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold">Thông Tin Định Danh</CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground">Thiết lập thông tin cơ bản cho hồ sơ thương hiệu của bạn.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-sm font-bold">Tên Hồ Sơ</Label>
                  <Input
                    id="name"
                    placeholder="VD: Thương Hiệu ABC"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-10 rounded-md bg-background border-input"
                  />
                  <p className="text-[11px] text-muted-foreground">Tên hiển thị chính cho hồ sơ này.</p>
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="company" className="text-sm font-bold">Tên Doanh Nghiệp (Tùy chọn)</Label>
                  <Input
                    id="company"
                    placeholder="VD: Công ty TNHH ABC"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="h-10 rounded-md bg-background border-input"
                  />
                  <p className="text-[11px] text-muted-foreground">Pháp nhân quản lý hồ sơ này.</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="bio" className="text-sm font-bold">Mô Tả</Label>
                <Textarea
                  id="bio"
                  placeholder="Giới thiệu ngắn gọn về hồ sơ này..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="rounded-md bg-background border-input resize-none p-3"
                />
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  onClick={handleNext}
                  disabled={!form.name.trim()}
                  className="h-10 px-8 font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  Chọn Gói Dịch Vụ
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="p-8 border-b border-border/50 bg-muted/5">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-500/10">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold">Đăng Ký Gói Dịch Vụ</CardTitle>
                  <CardDescription className="text-sm font-medium text-muted-foreground">Chọn gói dịch vụ phù hợp để kích hoạt hồ sơ.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <SubscriptionPlansPage
                onPlanSelect={handlePlanSelect}
                showCurrentPlan={false}
                isLoading={isSubmitting}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


