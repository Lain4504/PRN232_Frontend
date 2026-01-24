"use client"

import React, { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"

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
      {/* Tactical Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Header - Fixed */}
      <DashboardHeader />

      <div className="flex h-full w-full max-w-full">
        {/* Custom Sidebar with hover expand - desktop only */}
        {/* Added z-40 to stay above content but below header/modals if needed */}
        <div className="group relative hidden lg:block z-40">
          <div className={"fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border/40 bg-background/60 backdrop-blur-xl transition-all duration-300 ease-in-out overflow-hidden hover:bg-background/80 shadow-[1px_0_20px_rgba(0,0,0,0.02)] " + (sidebarMode === 'expanded' ? 'w-64' : sidebarMode === 'collapsed' ? 'w-[4.5rem]' : 'w-[4.5rem] hover:w-64')}>
            <DashboardSidebar />
          </div>
        </div>

        {/* Main Content Area - adjusted margins and z-index */}
        <div className={"flex flex-col flex-1 min-h-0 max-w-full overflow-hidden dashboard-content relative z-10 transition-all duration-300 " + (sidebarMode === 'expanded' ? 'lg:ml-64' : 'lg:ml-[4.5rem]')}>
          <main className="flex-1 overflow-x-hidden max-w-full scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}