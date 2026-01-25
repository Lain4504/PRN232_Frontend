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
    if (typeof window === 'undefined') return

    const stored = localStorage.getItem('sidebarMode') as 'expanded' | 'collapsed' | 'hover' | null
    if (stored) setSidebarMode(stored)

    const onModeChange = (e: CustomEvent<'expanded' | 'collapsed' | 'hover'>) => {
      setSidebarMode(e.detail)
    }
    window.addEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)

    return () => window.removeEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
  }, [])

  return (
    <div className="h-screen w-full overflow-hidden bg-background font-fira-sans selection:bg-primary/30 selection:text-primary-foreground">
      {/* Global Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none -z-10" />

      <DashboardHeader />

      <div className="flex h-[calc(100vh-64px)] w-full">
        {/* Sidebar wrapper */}
        <aside className="hidden lg:block z-40 relative">
          <div className={cn(
            "h-full border-r border-white/5 bg-background/40 backdrop-blur-xl transition-all duration-300 ease-in-out overflow-hidden shadow-2xl",
            sidebarMode === 'expanded' ? 'w-72' : sidebarMode === 'collapsed' ? 'w-[70px]' : 'w-[70px] hover:w-72'
          )}>
            <div className="absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent right-0" />
            <DashboardSidebar />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto scroll-smooth">
          <div className="min-h-full p-1 lg:p-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}