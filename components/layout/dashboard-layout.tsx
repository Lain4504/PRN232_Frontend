"use client"

import React, { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
// Custom sidebar không cần SidebarProvider
// Tab system đã được loại bỏ
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { Bell, Search, Settings, Building2, Plus, Check, Zap, Menu } from "lucide-react"
import { SearchCommand } from "@/components/search/search-command"
import { MobileSearchCommand } from "@/components/search/mobile-search-command"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Header component
interface DashboardHeaderProps {
  user?: User | null
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const [selectedOrganization, setSelectedOrganization] = useState("Lain4504's Org")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock organizations data - trong thực tế sẽ fetch từ API
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
      {/* Header chính */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 px-2 lg:px-3">
          {/* Mobile Menu Button - chỉ hiện trên mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="h-full">
                <DashboardSidebar 
                  user={{
                    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
                    email: user?.email || 'user@example.com',
                    avatar: user?.user_metadata?.avatar_url,
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <Zap className="size-4 lg:size-5 text-green-500" />
            <span className="text-muted-foreground hidden sm:inline">/</span>
            <Building2 className="size-3 lg:size-4 text-muted-foreground" />
          </div>
          
          {/* Organization Selector - ẩn trên mobile nhỏ */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-1 lg:px-2 py-1 h-auto hover:bg-transparent">
                <span className="font-medium text-sm lg:text-base truncate max-w-[120px] lg:max-w-none">
                  {selectedOrganization}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="start">
              {/* Search Input */}
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
              
              {/* Organization List */}
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
                
                {/* All Organizations */}
                <DropdownMenuItem className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex aspect-square size-6 items-center justify-center rounded bg-muted">
                      <Building2 className="size-3" />
                    </div>
                    <span className="text-sm">All Organizations</span>
                  </div>
                </DropdownMenuItem>
                
                {/* New Organization */}
                <DropdownMenuItem className="px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex aspect-square size-6 items-center justify-center rounded bg-muted">
                      <Plus className="size-3" />
                    </div>
                    <span className="text-sm">+ New organization</span>
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right side - Search, Notifications, User */}
        <div className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3">
          {/* Desktop Search */}
          <div className="hidden lg:block">
            <SearchCommand />
          </div>

          {/* Mobile Search Button */}
          <div className="lg:hidden">
            <MobileSearchCommand />
          </div>

          {/* Notifications - ẩn trên mobile nhỏ */}
          <Button variant="ghost" size="icon" className="relative hidden sm:flex">
            <Bell className="h-4 w-4" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-7 w-7 lg:h-8 lg:w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                  <AvatarFallback className="text-xs">
                    {user?.user_metadata?.full_name 
                      ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                      : user?.email?.[0]?.toUpperCase() || 'U'
                    }
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Tab Bar đã được loại bỏ */}
    </>
  )
}

// Main layout component
interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <div>
      <div className="flex h-screen w-full">
        {/* Custom Sidebar với hover expand - chỉ hiện trên desktop */}
        <div className="group relative hidden lg:block">
          <div className="fixed left-0 top-12 h-[calc(100vh-3rem)] w-12 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out hover:w-64 z-40 overflow-hidden">
            <DashboardSidebar 
              user={{
                name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
                email: user?.email || 'user@example.com',
                avatar: user?.user_metadata?.avatar_url,
              }}
            />
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex flex-col flex-1 pt-12 lg:ml-12 min-h-0">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      
      {/* Header được đặt ngoài sidebar để trải dài hết màn hình */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <DashboardHeader user={user} />
      </div>
    </div>
  )
}