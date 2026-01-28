"use client"

import React from "react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

// Main layout component
interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-[#fcfcfd] dark:bg-slate-950 selection:bg-slate-900 dark:selection:bg-primary selection:text-white transition-colors duration-300">
        {/* Subtle decorative background gradient */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-100/50 dark:from-slate-900/20 via-transparent to-transparent pointer-events-none -z-10" />

        <DashboardSidebar />

        <SidebarInset className="bg-transparent flex flex-col flex-1 min-w-0 transition-all duration-300">
          <DashboardHeader />
          <main className="flex-1 w-full p-4 md:p-6 lg:p-8 overflow-x-hidden">
            <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
