"use client"

import React from "react"
import { SearchCommand } from "@/components/search/search-command"
import { MobileSearchCommand } from "@/components/search/mobile-search-command"
import { EnhancedUserMenu } from "@/components/layout/enhanced-user-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { UserResponseDto } from "@/lib/types/user"
import { Separator } from "@/components/ui/separator"

interface ProfileHeaderProps {
  user?: UserResponseDto | null
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-md px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4 hidden md:block" />
        <div className="hidden lg:block text-sm font-medium text-muted-foreground">
          Tổng quan hồ sơ
        </div>
      </div>

      <div className="flex items-center gap-4">
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
