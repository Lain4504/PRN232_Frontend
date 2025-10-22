"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/lib/contexts/profile-context'
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeProfileId, isLoading } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !activeProfileId) {
      // No active profile, redirect to profile selection
      router.replace('/overview')
    }
  }, [activeProfileId, isLoading, router])

  // Show loading while checking profile context
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile context...</p>
        </div>
      </div>
    )
  }

  // If no active profile, don't render dashboard
  if (!activeProfileId) {
    return null
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
