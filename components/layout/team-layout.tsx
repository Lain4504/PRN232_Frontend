"use client"

import React from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import { TeamSidebar } from "@/components/layout/team-sidebar"
import { TeamHeader } from "@/components/layout/team-header"
import { useTeam } from "@/lib/contexts/team-context"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

// Main layout component for team workspace
interface TeamLayoutProps {
  children: React.ReactNode
}

export default function TeamLayout({ children }: TeamLayoutProps) {
  const { user } = useAuth()
  const { activeTeam, activeTeamId, isLoading: teamLoading } = useTeam()

  // Show loading while team context is loading or if we have an activeTeamId but not activeTeam yet
  if (teamLoading || (activeTeamId && !activeTeam)) {
    return (
      <div className="h-screen w-full overflow-hidden flex items-center justify-center bg-background font-fira-sans">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Authenticating Team Protocol...</p>
        </div>
      </div>
    )
  }

  // If no active team but we have activeTeamId, something went wrong
  if (!activeTeam && activeTeamId) {
    return null
  }

  // If no active team and no activeTeamId, show error
  if (!activeTeam && !activeTeamId) {
    return (
      <div className="h-screen w-full overflow-hidden flex items-center justify-center bg-background font-fira-sans">
        <div className="text-center space-y-4">
          <div className="text-destructive font-black text-xl uppercase tracking-tighter">Access Denied</div>
          <p className="text-muted-foreground font-medium">No active team detected in current session.</p>
        </div>
      </div>
    )
  }

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background font-fira-sans selection:bg-primary/30 selection:text-primary-foreground">
        {/* Global Background Gradient */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none -z-10" />

        <TeamSidebar />

        <SidebarInset className="bg-transparent flex flex-col flex-1 min-w-0 transition-all duration-300">
          <TeamHeader user={user} team={activeTeam} />
          <main className="flex-1 w-full p-2 lg:p-4 overflow-x-hidden">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
