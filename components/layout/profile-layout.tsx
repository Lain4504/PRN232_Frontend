"use client"

import React, { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { ProfileSidebar } from "@/components/layout/profile-sidebar"
import { ProfileHeader } from "@/components/layout/profile-header"
import { cn } from "@/lib/utils"

// Main layout component
interface ProfileLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
}

export default function ProfileLayout({ children, showSidebar = true }: ProfileLayoutProps) {
  const { data: user } = useUser()
  const [sidebarMode, setSidebarMode] = useState<"expanded" | "collapsed" | "hover">("hover")

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (isMobile) {
      setSidebarMode('expanded')
    } else {
      const stored = localStorage.getItem('sidebarMode') as 'expanded' | 'collapsed' | 'hover' | null
      if (stored === 'expanded' || stored === 'collapsed' || stored === 'hover') {
        setSidebarMode(stored)
      }
    }

    const onModeChange = (e: CustomEvent<'expanded' | 'collapsed' | 'hover'>) => {
      const mode = e.detail
      const nowMobile = window.matchMedia('(max-width: 1023px)').matches
      if (nowMobile) {
        setSidebarMode('expanded')
        return
      }
      if (mode === 'expanded' || mode === 'collapsed' || mode === 'hover') setSidebarMode(mode)
    }

    const mq = window.matchMedia('(max-width: 1023px)')
    const onMqChange = () => {
      if (mq.matches) {
        setSidebarMode('expanded')
      } else {
        const stored = localStorage.getItem('sidebarMode') as 'expanded' | 'collapsed' | 'hover' | null
        setSidebarMode(stored || 'hover')
      }
    }

    mq.addEventListener?.('change', onMqChange)
    window.addEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
    return () => {
      mq.removeEventListener?.('change', onMqChange)
      window.removeEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
    }
  }, [])

  return (
    <div className="h-screen w-full overflow-hidden bg-background">
      {/* Tactical Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Header - No wrapper needed as it's fixed inside */}
      <ProfileHeader user={user} />

      <div className="flex h-full w-full max-w-full">
        {/* Custom Sidebar with hover expand - desktop only */}
        {showSidebar && (
          <div className="group relative hidden lg:block z-40">
            <div className={cn(
              "fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border/40 bg-background/60 backdrop-blur-xl transition-all duration-300 ease-in-out overflow-hidden hover:bg-background/80 shadow-[1px_0_20px_rgba(0,0,0,0.02)]",
              sidebarMode === 'expanded' ? 'w-64' : sidebarMode === 'collapsed' ? 'w-[4.5rem]' : 'w-[4.5rem] hover:w-64'
            )}>
              <ProfileSidebar />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={cn(
          "flex flex-col flex-1 min-h-0 max-w-full overflow-hidden profile-content relative z-10 transition-all duration-300",
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