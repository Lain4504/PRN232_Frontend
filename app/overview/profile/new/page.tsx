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
    try {
      if (!user?.id) {
        toast.error('Please login to create a profile')
        return
      }

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
      toast.error('Failed to create profile. Please try again.')
    }
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Create Profile</h1>
            {step === 1 ? (
              <Link href="/overview">
                <Button variant="ghost" className="h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3 w-3 mr-2" />
                  Cancel
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" onClick={handleBack} className="h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-border/30'}`}></div>
            <div className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-border/30'}`}></div>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 ? (
          <Card className="border border-border/40 shadow-xl shadow-black/5 bg-card/60 backdrop-blur-xl rounded-[2rem]">
            <CardHeader className="pb-8 pt-8 px-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Profile Identity</CardTitle>
                  <CardDescription className="text-muted-foreground font-medium mt-1">Establish the core details for this brand profile.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Profile Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Acme Brand"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium focus:bg-background transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company (Optional)</Label>
                  <Input
                    id="company"
                    placeholder="e.g. Acme Inc."
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="h-12 rounded-xl bg-muted/20 border-border/40 font-medium focus:bg-background transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                <Textarea
                  id="bio"
                  placeholder="Briefly describe the purpose of this profile..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="rounded-xl bg-muted/20 border-border/40 font-medium resize-none focus:bg-background transition-all p-4"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNext}
                  disabled={!form.name.trim()}
                  className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  Continue to Plan
                  <ArrowLeft className="h-3 w-3 ml-2 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border/40 shadow-xl shadow-black/5 bg-card/60 backdrop-blur-xl rounded-[2rem]">
            <CardHeader className="pb-8 pt-8 px-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tight">Select Protocol</CardTitle>
                  <CardDescription className="text-muted-foreground font-medium mt-1">Choose the operational tier for this profile.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-6">
              <SubscriptionPlansPage onPlanSelect={handlePlanSelect} showCurrentPlan={false} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


