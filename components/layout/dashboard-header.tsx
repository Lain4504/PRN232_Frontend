"use client"

import React, { useState } from "react"
import { User } from "@supabase/supabase-js"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import {  Search, Building2, Plus, Check, Zap, Menu } from "lucide-react"
import { SearchCommand } from "@/components/search/search-command"
import { MobileSearchCommand } from "@/components/search/mobile-search-command"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserDropdown } from "@/components/layout/user-dropdown"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NotificationsDropdown } from "@/components/ui/notifications-dropdown"

interface DashboardHeaderProps {
  user?: User | null
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [selectedOrganization, setSelectedOrganization] = useState("Lain4504's Org")
  const [searchTerm, setSearchTerm] = useState("")

  const organizations = [
    { id: "1", name: "Lain4504's Org", type: "Personal", isActive: true },
    { id: "2", name: "Work Organization", type: "Business", isActive: false },
    { id: "3", name: "Client Org", type: "Client", isActive: false },
  ]

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
              <div className="h-full">
                <DashboardSidebar/>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Zap className="size-4 lg:size-5 text-primary" />
            <span className="text-muted-foreground hidden sm:inline">/</span>
            <Building2 className="size-3 lg:size-4 text-muted-foreground" />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-1 lg:px-2 py-1 h-auto hover:bg-transparent">
                <span className="font-medium text-sm lg:text-base truncate max-w-[120px] lg:max-w-none">
                  {selectedOrganization}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="start">
              <div className="px-3 py-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Find organization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              
              <div className="py-1">
                {filteredOrganizations.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
                      org.isActive ? 'bg-accent' : ''
                    }`}
                    onClick={() => {
                      setSelectedOrganization(org.name)
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex aspect-square size-6 items-center justify-center rounded bg-muted">
                        <Building2 className="size-3" />
                      </div>
                      <span className="text-sm">{org.name}</span>
                    </div>
                    {org.isActive && (
                      <Check className="size-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild className="px-3 py-2">
                  <Link href="/dashboard/organizations">
                    <div className="flex items-center gap-3">
                      <div className="flex aspect-square size-6 items-center justify-center rounded bg-muted">
                        <Building2 className="size-3" />
                      </div>
                      <span className="text-sm">All Organizations</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="px-3 py-2">
                  <Link href="/dashboard/organizations/new">
                    <div className="flex items-center gap-3">
                      <div className="flex aspect-square size-6 items-center justify-center rounded bg-muted">
                        <Plus className="size-3" />
                      </div>
                      <span className="text-sm">+ New organization</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3">
          <div className="hidden lg:block">
            <SearchCommand />
          </div>

          <div className="lg:hidden">
            <MobileSearchCommand />
          </div>

          <NotificationsDropdown />

          <UserDropdown user={user} />
        </div>
      </header>
    </>
  )
}


