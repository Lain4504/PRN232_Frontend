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
        <div className="space-y-2">
          {step === 1 ? (
            <Link href="/overview">
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleBack} className="p-0 h-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <h1 className="text-xl font-bold tracking-tight text-foreground">Create Profile</h1>
          <p className="text-xs text-muted-foreground">Step {step} of 2</p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-3">
          <div className={`h-2 rounded-full flex-1 ${step >= 1 ? 'bg-primary/80' : 'bg-muted'}`}></div>
          <div className={`h-2 rounded-full flex-1 ${step >= 2 ? 'bg-primary/80' : 'bg-muted'}`}></div>
        </div>

        {/* Step Content */}
        {step === 1 ? (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-xs">Tell us about your profile or business.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">Profile name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Acme Brand"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="company" className="text-xs">Company name (optional)</Label>
                  <Input
                    id="company"
                    placeholder="e.g. Acme Inc."
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-xs">Description</Label>
                <Textarea
                  id="bio"
                  placeholder="Short description for this profile"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleNext} disabled={!form.name.trim()} className="min-w-[120px]">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Choose Subscription Plan
              </CardTitle>
              <CardDescription className="text-xs">Select a plan for this profile.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-4">
              <SubscriptionPlansPage onPlanSelect={handlePlanSelect} showCurrentPlan={false} />
              <div className="pt-2">
                <Button variant="ghost" onClick={() => setStep(1)} className="p-0 h-auto">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Profile Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


