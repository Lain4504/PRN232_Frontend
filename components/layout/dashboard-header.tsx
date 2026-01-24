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
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/40 bg-background/60 backdrop-blur-2xl px-6 sticky top-0 z-50 transition-all duration-300 font-fira-sans">
        <div className="flex items-center gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-xl hover:bg-muted/50 transition-colors">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r border-border/40 bg-background/95 backdrop-blur-xl">
              <SheetTitle className="sr-only">Platform Navigation</SheetTitle>
              <div className="h-full py-4">
                <DashboardSidebar />
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-3 group transition-all duration-300 hover:scale-[1.02]">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 transition-transform group-hover:rotate-[15deg] group-hover:scale-105">
              <Zap className="h-4 w-4 text-primary-foreground fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[10px] uppercase tracking-[0.4em] leading-none mb-0.5 text-primary/80">Aisam</span>
              <span className="font-bold text-[8px] uppercase tracking-widest leading-none text-muted-foreground/60">Intelligence</span>
            </div>
          </Link>

          <div className="h-8 w-px bg-border/40 mx-2 hidden lg:block" />

          {/* Profile Switcher - Styled as high-end toggle */}
          <div className="hidden lg:block">
            <ProfileSwitcher />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <SearchCommand />
          </div>

          <div className="md:hidden">
            <MobileSearchCommand />
          </div>

          <div className="h-6 w-px bg-border/40 mx-1" />

          {user && (
            <div className="pl-1 transition-all duration-300 hover:scale-110 active:scale-95">
              <EnhancedUserMenu user={user} />
            </div>
          )}
        </div>
      </header>
    </>
  )
}


