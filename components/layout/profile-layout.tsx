"use client"

import React, { useState, useEffect } from "react"
import { useUser } from "@/hooks/use-user"
import { ProfileSidebar } from "@/components/layout/profile-sidebar"
import { ProfileHeader } from "@/components/layout/profile-header"

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
      <div className="h-screen w-full overflow-hidden">
        <div className="flex h-full w-full max-w-full">
          {/* Custom Sidebar với hover expand - chỉ hiện trên desktop khi showSidebar = true */}
          {showSidebar && (
            <div className="group relative hidden lg:block">
              <div className={"fixed left-0 top-12 h-[calc(100vh-3rem)] bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-40 overflow-hidden " + (sidebarMode === 'expanded' ? 'w-64' : sidebarMode === 'collapsed' ? 'w-12' : 'w-12 hover:w-64')}>
                <ProfileSidebar/>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className={"flex flex-col flex-1 pt-12 min-h-0 max-w-full overflow-hidden profile-content " + (sidebarMode === 'expanded' ? 'lg:ml-64' : 'lg:ml-12')}>
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