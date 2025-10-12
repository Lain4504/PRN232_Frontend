"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"

// Main layout component
interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
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

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setUser(session?.user ?? null)
        }
    )

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
    }
  }, [supabase.auth])

  return (
      <div className="h-screen w-full overflow-hidden">
        <div className="flex h-full w-full max-w-full">
          {/* Custom Sidebar với hover expand - chỉ hiện trên desktop */}
          <div className="group relative hidden lg:block">
            <div className={"fixed left-0 top-12 h-[calc(100vh-3rem)] bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-40 overflow-hidden " + (sidebarMode === 'expanded' ? 'w-64' : sidebarMode === 'collapsed' ? 'w-12' : 'w-12 hover:w-64')}>
              <DashboardSidebar/>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={"flex flex-col flex-1 pt-12 min-h-0 max-w-full overflow-hidden dashboard-content " + (sidebarMode === 'expanded' ? 'lg:ml-64' : 'lg:ml-12')}>
            <main className="flex-1 overflow-y-auto overflow-x-hidden max-w-full">
              {children}
            </main>
          </div>
        </div>

        {/* Header được đặt ngoài sidebar để trải dài hết màn hình */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <DashboardHeader user={user} />
        </div>
      </div>
  )
}