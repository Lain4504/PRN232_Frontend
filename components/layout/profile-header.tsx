"use client"

import React from "react"
import { SearchCommand } from "@/components/search/search-command"
import { MobileSearchCommand } from "@/components/search/mobile-search-command"
import { EnhancedUserMenu } from "@/components/layout/enhanced-user-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { UserResponseDto } from "@/lib/types/user"

interface ProfileHeaderProps {
  user?: UserResponseDto | null
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-slate-100 dark:bg-slate-800 mx-2 hidden md:block" />
        <div className="hidden lg:block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Tổng quan hồ sơ
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden md:block">
          <SearchCommand />
        </div>

        <div className="md:hidden">
          <MobileSearchCommand />
        </div>

        <EnhancedUserMenu user={user} />
      </div>
    </header>
  )
}
