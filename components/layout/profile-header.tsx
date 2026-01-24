"use client"

import React from "react"
import Link from "next/link"
import { ProfileSidebar } from "@/components/layout/profile-sidebar"
import { Zap, Menu } from "lucide-react"
import { SearchCommand } from "@/components/search/search-command"
import { MobileSearchCommand } from "@/components/search/mobile-search-command"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { EnhancedUserMenu } from "@/components/layout/enhanced-user-menu"
import type { UserResponseDto } from "@/lib/types/user"

interface ProfileHeaderProps {
  user?: UserResponseDto | null
}

export function ProfileHeader({ user }: ProfileHeaderProps) {

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-border/40 bg-background/80 backdrop-blur-3xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex items-center gap-2 px-4 lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                <Menu className="h-5 w-5 stroke-[2.5]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r border-border/40 bg-background/95 backdrop-blur-3xl">
              <SheetTitle className="sr-only">Profile Navigation</SheetTitle>
              <div className="h-full">
                <ProfileSidebar />
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/overview" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
              <Zap className="size-5 text-primary stroke-[3]" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight leading-none">AISAM</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] leading-none">Nexus Protocol</span>
            </div>
          </Link>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-2 lg:gap-4 px-4 lg:px-6">
          <div className="hidden lg:block">
            <SearchCommand />
          </div>

          <div className="lg:hidden">
            <MobileSearchCommand />
          </div>

          <div className="h-8 w-px bg-border/40 mx-2 hidden lg:block" />

          <EnhancedUserMenu user={user} />
        </div>
      </header>
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16" />
    </>
  )
}

