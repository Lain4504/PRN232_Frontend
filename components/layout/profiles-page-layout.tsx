"use client"

import React from "react"
import { useUser } from "@/hooks/use-user"
import { ProfileHeader } from "@/components/layout/profile-header"

// Layout component for main profiles page without sidebar
interface ProfilesPageLayoutProps {
  children: React.ReactNode
}

export default function ProfilesPageLayout({ children }: ProfilesPageLayoutProps) {
  const { data: user } = useUser()

  return (
      <div className="h-screen w-full overflow-hidden">
        <div className="flex h-full w-full max-w-full">
          {/* Main Content Area - no sidebar margin */}
          <div className="flex flex-col flex-1 pt-12 min-h-0 max-w-full overflow-hidden">
            <main className="flex-1 overflow-x-hidden max-w-full">
              {children}
            </main>
          </div>
        </div>

        {/* Header được đặt ngoài sidebar để trải dài hết màn hình */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <ProfileHeader user={user} />
        </div>
      </div>
  )
}
