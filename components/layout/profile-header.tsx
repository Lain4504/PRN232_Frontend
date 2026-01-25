"use client"

import React from "react"
import Link from "next/link"
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
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-background/60 backdrop-blur-2xl px-4 shadow-sm font-fira-sans transition-all duration-300">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden md:block">
          <SearchCommand />
        </div>

        <div className="md:hidden">
          <MobileSearchCommand />
        </div>

        <div className="h-6 w-px bg-white/10 mx-1 hidden lg:block" />

        <EnhancedUserMenu user={user} />
      </div>
    </header>
  )
}

