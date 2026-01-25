"use client"

import React from "react"
import { useUser } from "@/hooks/use-user"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { Zap, Menu, Command } from "lucide-react"
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
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-background/60 backdrop-blur-2xl px-6 shadow-sm font-fira-sans transition-all duration-300">
        <div className="flex items-center gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r border-white/10 bg-background/95 backdrop-blur-xl">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <DashboardSidebar />
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="size-9 bg-primary result-xl rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-y-full group-hover:translate-y-[-100%] transition-transform duration-700" />
              <Zap className="size-5 text-primary-foreground fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tighter text-foreground leading-none italic">AISAM</span>
              <span className="text-[8px] font-black text-primary uppercase tracking-[0.25em] leading-none opacity-80 group-hover:opacity-100 transition-opacity">Console</span>
            </div>
          </Link>

          <div className="h-8 w-px bg-white/10 mx-2 hidden lg:block" />

          {/* Profile Switcher */}
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

          <div className="h-8 w-px bg-white/10 mx-1 hidden lg:block" />

          {user && (
            <div className="pl-1">
              <EnhancedUserMenu user={user} />
            </div>
          )}
        </div>
      </header>
      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}
