"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SubscriptionPlansPage } from "@/components/subscription/subscription-plans-page"
import type { SubscriptionPlan } from "@/lib/types/subscription"
import { Building2, ArrowLeft, CheckCircle, User, CreditCard } from "lucide-react"
import Link from "next/link"

export default function CreateProfilePage() {
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

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    // Redirect to payments after choosing a plan
    const search = new URLSearchParams({ planId: String(plan.id) }).toString()
    window.location.href = `/(dashboard)/payments?${search}`
  }


  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
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
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Create Profile</h1>
        </div>

        {/* Step Indicators */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Step {step} of 2
            </span>
          </div>
          
          <div className="flex items-start justify-between">
            {/* Step 1 */}
            <div className={`flex flex-col items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                step >= 1 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Profile Details</span>
            </div>
            
            {/* Progress Line with Gradient */}
            <div className="flex-1 mx-4 relative flex items-center">
              <div className="h-1 bg-muted rounded-full overflow-hidden w-full">
                <div 
                  className={`h-full transition-all duration-500 ease-in-out ${
                    step >= 2 
                      ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-green-500 w-full' 
                      : step >= 1 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 w-1/2' 
                        : 'w-0'
                  }`}
                ></div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className={`flex flex-col items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                step >= 2 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step === 2 ? '2' : <CheckCircle className="h-4 w-4" />}
              </div>
              <span className="text-sm font-medium">Choose Plan</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Tell us about your profile or business to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Profile name *</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Acme Brand" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company name (optional)</Label>
                  <Input 
                    id="company" 
                    placeholder="e.g. Acme Inc." 
                    value={form.companyName} 
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Description</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Short description for this profile" 
                  value={form.bio} 
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleNext} 
                  disabled={!form.name.trim()}
                  className="min-w-[120px]"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Choose Subscription Plan
              </CardTitle>
              <CardDescription>
                Select a billing plan for your profile. The profile type will be determined by your subscription choice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionPlansPage onPlanSelect={handlePlanSelect} showCurrentPlan={false} />
              
              <div className="flex justify-start pt-6 border-t">
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


