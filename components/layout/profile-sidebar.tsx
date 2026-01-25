"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  User,
  Users,
  Zap,
  Settings,
  Shield,
  History,
  FileText,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar"

// Profile navigation items
interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

// Identity navigation items
const identityNavItems: NavItem[] = [
  {
    title: "My Profiles",
    url: "/overview",
    icon: User,
  },
  {
    title: "My Teams",
    url: "/overview/teams",
    icon: Users,
  }
]

// Account navigation items
const accountNavItems: NavItem[] = [
  {
    title: "Preferences",
    url: "/overview/account",
    icon: Settings,
  },
  {
    title: "Security",
    url: "/overview/security",
    icon: Shield,
  },
  {
    title: "Payment History",
    url: "/overview/payment",
    icon: History,
  },
]

// System navigation items
const systemNavItems: NavItem[] = [
  {
    title: "Audit Logs",
    url: "/overview/logs",
    icon: FileText,
  },
]

export function ProfileSidebar() {
  const pathname = usePathname()

  const renderNavGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 mb-2 group-data-[collapsible=icon]:hidden">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.title}
                  className={cn(
                    "h-10 rounded-xl transition-all duration-300 group relative overflow-hidden group-data-[collapsible=icon]:mx-auto",
                    isActive ? "bg-primary/10 text-primary shadow-inner hover:bg-primary/15 hover:text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <Link href={item.url} className="flex items-center w-full group-data-[collapsible=icon]:justify-center">
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_8px_2px_rgba(var(--primary),0.5)]" />
                    )}
                    <item.icon className={cn("size-4 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive && "text-primary")} />
                    <span className="font-bold text-[11px] uppercase tracking-wide truncate ml-3 group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-background/40 backdrop-blur-xl">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-white/5">
        <div className="flex items-center gap-2 px-2 w-full transition-all duration-300 group-data-[collapsible=icon]:justify-center">
          <div className="size-8 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <Zap className="size-4 text-primary-foreground fill-current" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden transition-all duration-300">
            <span className="font-black text-base tracking-tighter text-foreground leading-none italic">AISAM</span>
            <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] leading-none opacity-80">Console</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4 px-2 group-data-[collapsible=icon]:!px-0 space-y-4">
        {renderNavGroup("Identity", identityNavItems)}
        {renderNavGroup("Account", accountNavItems)}
        {renderNavGroup("System", systemNavItems)}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
