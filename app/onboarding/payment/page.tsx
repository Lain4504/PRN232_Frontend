"use client"

import React, { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { getStripe, stripeOptions } from "@/lib/stripe"
import { api, endpoints } from "@/lib/api"
import { useAuth } from "@/lib/contexts/auth-context"
import { useProfile } from "@/lib/contexts/profile-context"
import { ProfileTypeEnum } from "@/lib/utils/profile-utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, ShieldCheck, Zap, Building2, ArrowRight, Sparkles, CreditCard, Lock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createSubscription } from "@/lib/api/subscription"
import { SubscriptionPlanEnum } from "@/lib/types/subscription"

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: "#1f2937", // foreground
            fontFamily: '"Fira Sans", sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
                color: "#a1a1aa", // muted-foreground
            },
        },
        invalid: {
            color: "#ef4444", // destructve
            iconColor: "#ef4444",
        },
    },
    hidePostalCode: true,
}

function PaymentForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const stripe = useStripe()
    const elements = useElements()
    const { session } = useAuth()
    const { setActiveProfile } = useProfile()

    const [isProcessing, setIsProcessing] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro'>('basic')
    const [cardError, setCardError] = useState<string | null>(null)
    const [pendingProfileId, setPendingProfileId] = useState<string | null>(null)

    const profileData = {
        name: searchParams.get('name') || 'Agency Workspace',
        companyName: searchParams.get('companyName') || 'My Agency',
        type: searchParams.get('type') || 'agency'
    }

    const plans = [
        {
            id: 'basic',
            name: 'Agency Basic',
            price: '$29',
            period: '/month',
            description: 'Essential tools for growing agencies.',
            features: [
                'Up to 5 Brands',
                '5 Team Members',
                'Core AI Generation',
                'Standard Analytics'
            ],
            icon: Building2,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            planEnum: SubscriptionPlanEnum.Basic
        },
        {
            id: 'pro',
            name: 'Agency Pro',
            price: '$99',
            period: '/month',
            description: 'Advanced features for scaling operations.',
            features: [
                'Unlimited Brands',
                '20 Team Members',
                'Advanced AI Models',
                'Custom Analytics Dashboards',
                'Priority Support'
            ],
            icon: Zap,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            popular: true,
            planEnum: SubscriptionPlanEnum.Pro
        }
    ]

    const handleCheckout = async () => {
        if (!session?.user?.id) {
            toast.error("Session expired. Please log in.")
            return
        }

        if (!stripe || !elements) {
            toast.error("Stripe is not initialized.")
            return
        }

        setCardError(null)
        setIsProcessing(true)

        try {
            let profileId = pendingProfileId

            // 1. Create Profile (if not already created)
            if (!profileId) {
                const fd = new FormData()
                fd.append('Name', profileData.name)
                const selectedPlanObj = plans.find(p => p.id === selectedPlan)!
                fd.append('ProfileType', selectedPlanObj.planEnum.toString())
                fd.append('CompanyName', profileData.companyName)
                fd.append('Bio', `Agency Workspace (${selectedPlan.toUpperCase()} Plan)`)

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const profileResponse = await api.postForm<any>(endpoints.createProfile(session.user.id), fd)

                if (!profileResponse.success || !profileResponse.data) {
                    throw new Error(profileResponse.message || "Failed to initialize profile")
                }

                profileId = profileResponse.data.id
                setPendingProfileId(profileId) // Store for retry
            }

            // 2. Create Payment Method via Stripe
            const cardElement = elements.getElement(CardElement)
            if (!cardElement) throw new Error("Card element not found")

            // Re-fetch selected plan object for usage below
            const selectedPlanObj = plans.find(p => p.id === selectedPlan)!

            // Ensure we have a valid billing name, fallback to empty string if missing
            const billingName = session.user.fullName || profileData.companyName || ''

            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    name: billingName,
                    email: session.user.email
                }
            })

            if (stripeError) {
                setCardError(stripeError.message || "Payment method creation failed")
                setIsProcessing(false)
                return
            }

            if (!profileId) throw new Error("Profile ID is missing")

            // 3. Create Subscription on Backend
            await createSubscription({
                profileId: profileId,
                plan: selectedPlanObj.planEnum,
                paymentMethodId: paymentMethod.id,
                isRecurring: true
            })

            // 4. Success -> Update Context & Redirect
            setActiveProfile(profileId, {
                id: profileId,
                name: profileData.name,
                type: (selectedPlanObj.planEnum as unknown as ProfileTypeEnum),
                avatarUrl: undefined, // New profile has no avatar
                companyName: profileData.companyName,
                isOwner: true
            })

            toast.success(`Welcome to Agency ${selectedPlanObj.name}! Workspace activated.`)

            setTimeout(() => {
                router.push("/dashboard")
            }, 1000)

        } catch (error: unknown) {
            console.error("Checkout error:", error)
            toast.error((error as Error).message || "An error occurred during checkout.")
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
                        Secure Checkout
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase italic leading-none">
                        Elevate Your <span className="text-primary">Agency</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium italic">
                        Configure <span className="text-foreground font-bold">{profileData.companyName}</span> with a professional plan.
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
                                    ? cn("bg-card shadow-2xl scale-105", plan.id === 'pro' ? "border-purple-500/50 shadow-purple-500/10" : "border-blue-500/50 shadow-blue-500/10")
                                    : "border-border/50 bg-muted/20 hover:border-primary/30"
                            )}
                            onClick={() => setSelectedPlan(plan.id as 'basic' | 'pro')}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">
                                        Most Popular
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
                                    <span className="text-4xl font-black">{plan.price}</span>
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
                                    <span className="font-black uppercase tracking-widest text-sm italic">Payment Details</span>
                                </div>
                                <div className="flex gap-2 opacity-50">
                                    {/* Card brand icons placeholder */}
                                    <div className="h-6 w-10 bg-muted rounded border border-border/50" />
                                    <div className="h-6 w-10 bg-muted rounded border border-border/50" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 rounded-2xl bg-background border border-border/50 flex items-center justify-between">
                                    <span className="font-bold text-sm tracking-tight">Plan Selected: <span className="text-primary italic">{selectedPlan.toUpperCase()}</span></span>
                                    <span className="font-black">{plans.find(p => p.id === selectedPlan)?.price}</span>
                                </div>

                                {/* Stripe Card Element */}
                                <div className="p-4 rounded-2xl bg-white border border-input shadow-sm">
                                    <CardElement
                                        options={CARD_ELEMENT_OPTIONS}
                                        onChange={(e) => setCardError(e.error ? e.error.message : null)}
                                    />
                                </div>

                                {cardError && (
                                    <div className="flex items-center gap-2 text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg">
                                        <AlertCircle className="size-4" />
                                        {cardError}
                                    </div>
                                )}

                                <p className="text-[10px] text-muted-foreground text-center font-medium uppercase tracking-widest px-8">
                                    Stripe secure transaction. You will be billed effectively immediately.
                                </p>
                            </div>

                            <Button
                                className="w-full h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                size="lg"
                                onClick={handleCheckout}
                                disabled={isProcessing || !stripe || !elements}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="size-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Pay & Activate
                                        <ArrowRight className="size-5 ml-2" />
                                    </div>
                                )}
                            </Button>
                        </CardContent>
                        <CardFooter className="bg-muted/30 p-4 flex items-center justify-center gap-4">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <ShieldCheck className="size-3.5 text-emerald-500" />
                                SSL Encrypted
                            </div>
                            <div className="h-3 w-px bg-border/50" />
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <Sparkles className="size-3.5 text-primary" />
                                Powered by Stripe
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
            <Elements stripe={getStripe()} options={{
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#2563eb',
                        fontFamily: '"Fira Sans", sans-serif',
                    }
                }
            }}>
                <PaymentForm />
            </Elements>
        </Suspense>
    )
}
