"use client"

import React, { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api, endpoints } from "@/lib/api"
import { useAuth } from "@/lib/contexts/auth-context"
import { useProfile } from "@/lib/contexts/profile-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, ShieldCheck, Crown, Building2, ArrowRight, Sparkles, CreditCard, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createPayOSCheckoutLink } from "@/lib/api/subscription"
import { SubscriptionPlanEnum } from "@/lib/types/subscription"

function PaymentForm() {
    const searchParams = useSearchParams()
    const { session } = useAuth()

    const [isProcessing, setIsProcessing] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanEnum>(SubscriptionPlanEnum.Basic)
    const [pendingProfileId, setPendingProfileId] = useState<string | null>(null)

    const profileData = {
        name: searchParams.get('name') || 'Agency Workspace',
        companyName: searchParams.get('companyName') || 'My Agency',
        type: searchParams.get('type') || 'agency'
    }

    const plans = [
        {
            id: SubscriptionPlanEnum.Basic,
            name: 'Plus',
            price: '359.000',
            period: '/tháng',
            description: 'Công cụ thiết yếu cho các agency đang phát triển.',
            features: [
                'AI tạo nội dung (2 bài/ngày)',
                'AI tạo hình ảnh (7 hình/ngày)',
                'Lên lịch đăng (30 bài/tháng)',
                'Phân tích hiệu quả quảng cáo',
                'Tối đa 2 nền tảng & 3 tài khoản'
            ],
            icon: Building2,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
        },
        {
            id: SubscriptionPlanEnum.Pro,
            name: 'Premium',
            price: '559.000',
            period: '/tháng',
            description: 'Tính năng nâng cao cho quy mô lớn.',
            features: [
                'AI tạo nội dung (4 bài/ngày)',
                'AI tạo hình ảnh (10 hình/ngày)',
                'Lên lịch đăng không giới hạn',
                'Phân tích chiến lược chuyên sâu',
                'Tối đa 3 nền tảng & 5 tài khoản'
            ],
            icon: Crown,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            popular: true,
        }
    ]

    const handleCheckout = async () => {
        if (!session?.user?.id) {
            toast.error("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.")
            return
        }

        setIsProcessing(true)

        try {
            let profileId = pendingProfileId

            // 1. Create Profile (if not already created)
            if (!profileId) {
                const fd = new FormData()
                fd.append('Name', profileData.name)
                fd.append('ProfileType', selectedPlan.toString())
                fd.append('CompanyName', profileData.companyName)
                fd.append('Bio', `Agency Workspace (${selectedPlan === SubscriptionPlanEnum.Basic ? 'PLUS' : 'PREMIUM'} Plan)`)

                const profileResponse = await api.postForm<{ id: string }>(endpoints.createProfile(session.user.id), fd)

                if (!profileResponse.success || !profileResponse.data) {
                    throw new Error(profileResponse.message || "Không thể khởi tạo hồ sơ")
                }

                profileId = profileResponse.data.id
                setPendingProfileId(profileId)
            }

            // 2. Create PayOS Checkout Link
            // Note: In a real implementation, we might need to pass the profileId 
            // to the checkout link creation if the backend needs to associate it immediately.
            // Currently, our API uses the active profile from context.
            // We should ensure the profile is active or pass it.

            const checkoutData = await createPayOSCheckoutLink(selectedPlan)

            if (checkoutData?.checkoutUrl) {
                window.location.href = checkoutData.checkoutUrl
            } else {
                throw new Error("Không thể tạo liên kết thanh toán PayOS")
            }

        } catch (error: unknown) {
            console.error("Checkout error:", error)
            toast.error((error as Error).message || "Đã xảy ra lỗi trong quá trình thanh toán.")
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-background font-fira-sans py-20 px-4 animate-in fade-in duration-700">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                        <Lock className="size-3" />
                        Thanh toán an toàn
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase italic leading-none">
                        Nâng tầm <span className="text-primary">Agency</span> của bạn
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium italic">
                        Cấu hình <span className="text-foreground font-bold">{profileData.companyName}</span> với gói dịch vụ chuyên nghiệp.
                    </p>
                </div>

                {/* Plans Selection */}
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={cn(
                                "group relative overflow-hidden rounded-[32px] border-2 transition-all duration-500 cursor-pointer",
                                selectedPlan === plan.id
                                    ? cn("bg-card shadow-2xl scale-105", plan.id === SubscriptionPlanEnum.Pro ? "border-purple-500/50 shadow-purple-500/10" : "border-blue-500/50 shadow-blue-500/10")
                                    : "border-border/50 bg-muted/20 hover:border-primary/30"
                            )}
                            onClick={() => setSelectedPlan(plan.id)}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">
                                        Phổ biến nhất
                                    </div>
                                </div>
                            )}

                            <CardHeader className="p-8 md:p-10 pb-0">
                                <div className={cn(
                                    "size-14 rounded-2xl flex items-center justify-center mb-6",
                                    plan.bg, plan.color
                                )}>
                                    <plan.icon className="size-8" />
                                </div>
                                <CardTitle className="text-2xl font-black uppercase italic tracking-tight">
                                    {plan.name}
                                </CardTitle>
                                <CardDescription className="text-sm font-medium italic">
                                    {plan.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-8 md:p-10 space-y-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">{plan.price}đ</span>
                                    <span className="text-muted-foreground font-bold uppercase text-xs tracking-widest">
                                        {plan.period}
                                    </span>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-border/50">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Check className="size-3 text-primary stroke-[3]" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wide text-foreground/70">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Checkout Section */}
                <div className="max-w-xl mx-auto pt-8">
                    <Card className="rounded-[32px] border-2 border-primary/20 bg-primary/[0.02] overflow-hidden">
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="size-5 text-primary" />
                                    <span className="font-black uppercase tracking-widest text-sm italic">Chi tiết thanh toán</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 rounded-2xl bg-background border border-border/50 flex items-center justify-between">
                                    <span className="font-bold text-sm tracking-tight">Gói đã chọn: <span className="text-primary italic">{selectedPlan === SubscriptionPlanEnum.Basic ? 'PLUS' : 'PREMIUM'}</span></span>
                                    <span className="font-black">{plans.find(p => p.id === selectedPlan)?.price}đ</span>
                                </div>

                                <p className="text-[10px] text-muted-foreground text-center font-medium uppercase tracking-widest px-8">
                                    Thanh toán an toàn qua PayOS. Bạn sẽ được chuyển hướng để hoàn tất giao dịch.
                                </p>
                            </div>

                            <Button
                                className="w-full h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                size="lg"
                                onClick={handleCheckout}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="size-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Thanh toán & Kích hoạt
                                        <ArrowRight className="size-5 ml-2" />
                                    </div>
                                )}
                            </Button>
                        </CardContent>
                        <CardFooter className="bg-muted/30 p-4 flex items-center justify-center gap-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <ShieldCheck className="size-3.5 text-emerald-500" />
                                Mã hóa SSL
                            </div>
                            <div className="h-3 w-px bg-border/50" />
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <Sparkles className="size-3.5 text-primary" />
                                Tuyệt vời cùng PayOS
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        }>
            <PaymentForm />
        </Suspense>
    )
}
