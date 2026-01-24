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
      <header className="fixed top-0 left-0 right-0 z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/40 bg-background/80 backdrop-blur-3xl px-4 lg:px-6 transition-all duration-300 font-fira-sans shadow-sm">
        <div className="flex items-center gap-4 lg:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-xl hover:bg-muted/50 transition-colors">
                <Menu className="h-5 w-5 stroke-[2.5]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r border-border/40 bg-background/95 backdrop-blur-3xl">
              <SheetTitle className="sr-only">Platform Navigation</SheetTitle>
              <div className="h-full py-4">
                <DashboardSidebar />
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-3 group transition-all duration-300 hover:opacity-80">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)] transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5 text-primary stroke-[3]" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight leading-none text-foreground">AISAM</span>
              <span className="font-bold text-[9px] uppercase tracking-[0.2em] leading-none text-muted-foreground">Intelligence</span>
            </div>
          </Link>

          <div className="h-8 w-px bg-border/40 mx-2 hidden lg:block" />

          {/* Profile Switcher - Styled as high-end toggle */}
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

          <div className="h-8 w-px bg-border/40 mx-1 hidden lg:block" />

          {user && (
            <div className="pl-1 transition-all duration-300 hover:scale-110 active:scale-95">
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


