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
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Profile</h1>
            {step === 1 ? (
              <Link href="/overview">
                <Button variant="ghost" className="h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" onClick={handleBack} className="h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${step >= i ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 ? (
          <Card className="rounded-xl border shadow-sm">
            <CardHeader className="p-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold">Profile Identity</CardTitle>
                  <CardDescription className="text-sm font-medium">Define your brand identity to get started.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Profile Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Acme Brand"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-11 rounded-lg bg-background border-border/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-semibold">Company Name (Optional)</Label>
                  <Input
                    id="company"
                    placeholder="e.g. Acme Inc."
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="h-11 rounded-lg bg-background border-border/60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-semibold">Description</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about this brand..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  className="rounded-lg bg-background border-border/60 resize-none p-3"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleNext}
                  disabled={!form.name.trim()}
                  className="rounded-lg h-10 px-8 font-semibold"
                >
                  Choose a Plan
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-xl border shadow-sm">
            <CardHeader className="p-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold">Select Subscription</CardTitle>
                  <CardDescription className="text-sm font-medium">Choose a plan that fits your needs.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <SubscriptionPlansPage onPlanSelect={handlePlanSelect} showCurrentPlan={false} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


