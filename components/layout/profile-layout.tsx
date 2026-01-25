"use client"

import React from "react"
import { useUser } from "@/hooks/use-user"
import { ProfileSidebar } from "@/components/layout/profile-sidebar"
import { ProfileHeader } from "@/components/layout/profile-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

// Main layout component
interface ProfileLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export default function ProfileLayout({ children, showSidebar = true }: ProfileLayoutProps) {
  const { data: user } = useUser()

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background font-fira-sans selection:bg-primary/30 selection:text-primary-foreground">
        {/* Global Background Gradient */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none -z-10" />

        {showSidebar && <ProfileSidebar />}

        <SidebarInset className="bg-transparent flex flex-col flex-1 min-w-0 transition-all duration-300">
          <ProfileHeader user={user} />
          <main className="flex-1 w-full p-2 lg:p-4 overflow-x-hidden">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
