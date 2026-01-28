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
    // If profiles are still loading or we don't know the count yet, wait
    if (isLoading) return

    if (!activeProfileId) {
      // No active profile, user needs to select or create one
      router.replace('/overview')
    }
  }, [activeProfileId, isLoading, router])

  // Show loading while checking profile context
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Đang tải cấu hình hồ sơ...</p>
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
