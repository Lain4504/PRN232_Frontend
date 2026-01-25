"use client"

import React, { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { cn } from "@/lib/utils"

// Main layout component
interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarMode, setSidebarMode] = useState<"expanded" | "collapsed" | "hover">("hover")

  useEffect(() => {
    // init sidebar mode
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('sidebarMode') as 'expanded' | 'collapsed' | 'hover' | null) : null
    if (stored === 'expanded' || stored === 'collapsed' || stored === 'hover') {
      setSidebarMode(stored)
    }
    const onModeChange = (e: CustomEvent<'expanded' | 'collapsed' | 'hover'>) => {
      const mode = e.detail
      if (mode === 'expanded' || mode === 'collapsed' || mode === 'hover') setSidebarMode(mode)
    }
    window.addEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)

    return () => {
      window.removeEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
    }
  }, [])

  return (
    <div className="h-screen w-full overflow-hidden bg-background font-fira-sans">
      {/* Header - Fixed */}
      <DashboardHeader />

      <div className="flex h-full w-full max-w-full">
        {/* Sidebar wrapper */}
        <div className="group relative hidden lg:block z-40">
          <div className={cn(
            "fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border/20 bg-card transition-all duration-200 ease-in-out overflow-hidden shadow-sm",
            sidebarMode === 'expanded' ? 'w-64' : sidebarMode === 'collapsed' ? 'w-[4.5rem]' : 'w-[4.5rem] hover:w-64'
          )}>
            <DashboardSidebar />
          </div>
        </div>

        {/* Main Content Area */}
        <div className={cn(
          "flex flex-col flex-1 min-h-0 max-w-full overflow-hidden relative z-10 transition-all duration-200",
          sidebarMode === 'expanded' ? 'lg:ml-64' : 'lg:ml-[4.5rem]'
        )}>
          <main className="flex-1 overflow-x-hidden max-w-full scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}