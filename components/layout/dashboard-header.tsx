"use client"

import React from "react"
import { useUser } from "@/hooks/use-user"
import { SearchCommand } from "@/components/search/search-command"
import { MobileSearchCommand } from "@/components/search/mobile-search-command"
import { EnhancedUserMenu } from "@/components/layout/enhanced-user-menu"
import { ProfileSwitcher } from "@/components/profiles/profile-switcher"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardHeader() {
  const { data: user } = useUser()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-slate-100 dark:bg-slate-800 mx-2 hidden lg:block" />
        <div className="hidden lg:block">
          <ProfileSwitcher />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden md:block">
          <SearchCommand />
        </div>

        <div className="md:hidden">
          <MobileSearchCommand />
        </div>

        <div className="h-4 w-px bg-slate-100 dark:bg-slate-800 mx-1 hidden lg:block" />

        {user && (
          <div className="pl-1">
            <EnhancedUserMenu user={user} />
          </div>
        )}
      </div>
    </header>
  )
}
