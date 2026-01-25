"use client"

import React from "react"
import { useUser } from "@/hooks/use-user"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { Zap, Menu } from "lucide-react"
import { SearchCommand } from "@/components/search/search-command"
import { MobileSearchCommand } from "@/components/search/mobile-search-command"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { EnhancedUserMenu } from "@/components/layout/enhanced-user-menu"
import { ProfileSwitcher } from "@/components/profiles/profile-switcher"
import Link from "next/link"


export function DashboardHeader() {
  const { data: user } = useUser();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 lg:px-6 font-fira-sans">
        <div className="flex items-center gap-4 lg:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-lg">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0 border-r bg-background">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="h-full py-4">
                <DashboardSidebar />
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 transition-colors group-hover:bg-primary/20">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">AISAM</span>
          </Link>

          <div className="h-6 w-px bg-border mx-2 hidden lg:block" />

          {/* Profile Switcher */}
          <div className="hidden lg:block">
            <ProfileSwitcher />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden md:block">
            <SearchCommand />
          </div>

          <div className="md:hidden">
            <MobileSearchCommand />
          </div>

          <div className="h-6 w-px bg-border mx-1 hidden lg:block" />

          {user && (
            <div className="pl-1">
              <EnhancedUserMenu user={user} />
            </div>
          )}
        </div>
      </header>
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16" />
    </>
  )
}


