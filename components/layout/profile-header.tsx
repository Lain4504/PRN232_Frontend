"use client"

import React from "react"
import { ProfileSidebar } from "@/components/layout/profile-sidebar"
import { Zap, Menu } from "lucide-react"
import { SearchCommand } from "@/components/search/search-command"
import { MobileSearchCommand } from "@/components/search/mobile-search-command"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { EnhancedUserMenu } from "@/components/layout/enhanced-user-menu"
import { EnhancedNotifications } from "@/components/layout/enhanced-notifications"
import type { UserResponseDto } from "@/lib/types/user"

interface ProfileHeaderProps {
  user?: UserResponseDto | null
}

export function ProfileHeader({ user }: ProfileHeaderProps) {

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 px-2 lg:px-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Profile Navigation</SheetTitle>
              <div className="h-full">
                <ProfileSidebar/>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Zap className="size-4 lg:size-5 text-primary" />
            <span className="font-semibold text-sm lg:text-base">AISAM</span>
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3">
          <div className="hidden lg:block">
            <SearchCommand />
          </div>

          <div className="lg:hidden">
            <MobileSearchCommand />
          </div>

          <EnhancedNotifications />

          <EnhancedUserMenu user={user} />
        </div>
      </header>
    </>
  )
}
