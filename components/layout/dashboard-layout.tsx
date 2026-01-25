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
      <div className="flex min-h-screen w-full bg-background font-fira-sans selection:bg-primary/30 selection:text-primary-foreground">
        {/* Global Background Gradient */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none -z-10" />

        <DashboardSidebar />

        <SidebarInset className="bg-transparent flex flex-col flex-1 min-w-0 transition-all duration-300">
          <DashboardHeader />
          <main className="flex-1 w-full p-2 lg:p-4 overflow-x-hidden">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}