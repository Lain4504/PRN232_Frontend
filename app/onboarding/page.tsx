"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { UserTypeSelection } from "@/components/onboarding/user-type-selection"
import { api, endpoints } from "@/lib/api"
import { useAuth } from "@/lib/contexts/auth-context"
import { useProfile } from "@/lib/contexts/profile-context"
import { toast } from "sonner"
import { ProfileTypeEnum } from "@/lib/utils/profile-utils"
import { Profile } from "@/lib/types/omniadly-types"

export default function OnboardingPage() {
    const router = useRouter()
    const { session } = useAuth()
    const { setActiveProfile } = useProfile()
    const [isLoading, setIsLoading] = useState(false)

    const handleTypeSelect = async (type: 'individual' | 'agency') => {
        if (!session?.user?.id) {
            toast.error("Session expired. Please sign in again.")
            router.push("/auth/login")
            return
        }

        if (type === 'agency') {
            // Redirect to payment page for Agency
            router.push(`/onboarding/payment?type=agency&companyName=My Agency`)
            return
        }

        setIsLoading(true)
        try {
            const fd = new FormData()

            if (type === 'individual') {
                fd.append('Name', 'Personal Profile')
                fd.append('ProfileType', '0') // Free
                fd.append('Bio', 'My personal creative workspace')
            }

            const response = await api.postForm<Profile>(endpoints.createProfile(session.user.id), fd)

            if (response.success && response.data) {
                const newProfile = response.data

                // Update context
                setActiveProfile(newProfile.id, {
                    id: newProfile.id,
                    name: newProfile.name || newProfile.company_name || 'Personal Profile',
                    type: (newProfile.profileType as unknown as ProfileTypeEnum) || ProfileTypeEnum.Free,
                    avatarUrl: newProfile.avatarUrl,
                    companyName: newProfile.company_name,
                    isOwner: true,
                    status: newProfile.status ?? 1
                })

                toast.success("Personal workspace configured! Redirecting to dashboard...")

                // Give small delay for state persistence
                setTimeout(() => {
                    router.push("/dashboard")
                }, 1000)
            } else {
                throw new Error(response.message || "Failed to create profile")
            }
        } catch (error: unknown) {
            console.error("Onboarding error:", error)
            toast.error((error as Error).message || "An error occurred during configuration.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center py-20 px-4">
            <UserTypeSelection onSelect={handleTypeSelect} isLoading={isLoading} />
        </div>
    )
}
