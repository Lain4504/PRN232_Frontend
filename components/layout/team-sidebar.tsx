"use client"

import React from "react"
import { useParams, usePathname } from "next/navigation"
import Link from "next/link"
import { useTeam } from '@/lib/contexts/team-context'
import {
  Home,
  FileText,
  Sparkles,
  Package,
  CheckCircle,
  Mail,
  Calendar,
  Users,
  Megaphone,
  Briefcase
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
  SidebarSeparator
} from "@/components/ui/sidebar"

// Team navigation items with permissions
interface TeamNavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
}

export function TeamSidebar() {
  const pathname = usePathname()
  const params = useParams()
  const teamId = params.teamId as string
  const { hasPermission, activeTeam } = useTeam()

  // Team navigation items with permission checks
  const teamNavItems: TeamNavItem[] = [
    {
      title: "HQ Dashboard",
      url: `/team/${teamId}`,
      icon: Home,
    },
    {
      title: "Content Matrix",
      url: `/team/${teamId}/contents`,
      icon: FileText,
      permission: 'CREATE_CONTENT'
    },
    {
      title: "Product Registry",
      url: `/team/${teamId}/products`,
      icon: Package,
      permission: 'VIEW_POSTS'
    },
    {
      title: "Governance",
      url: `/team/${teamId}/approval`,
      icon: CheckCircle,
      permission: 'APPROVE_CONTENT'
    },
    {
      title: "AI Neural Core",
      url: `/team/${teamId}/contents/new`,
      icon: Sparkles,
      permission: 'SUBMIT_AI_GENERATION'
    },
    {
      title: "Broadcast Grid",
      url: `/team/${teamId}/posts`,
      icon: Mail,
      permission: 'VIEW_POSTS'
    },
    {
      title: "Timeline Sync",
      url: `/team/${teamId}/calendar`,
      icon: Calendar,
      permission: 'SCHEDULE_POST'
    },
    {
      title: "Active Signals",
      url: `/team/${teamId}/campaigns`,
      icon: Megaphone,
      permission: 'CREATE_CONTENT'
    },
    {
      title: "Operatives",
      url: `/team/${teamId}/settings`,
      icon: Users,
      permission: 'VIEW_TEAM_MEMBERS'
    }
  ]

  // Filter menu items based on permissions
  const visibleNavItems = teamNavItems.filter(item =>
    !item.permission || hasPermission(item.permission)
  )

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5 bg-background/40 backdrop-blur-xl">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-white/5 p-4">
        <div className="flex items-center gap-3 w-full transition-all duration-300 group-data-[collapsible=icon]:justify-center">
          <div className="size-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
            <Briefcase className="size-4 text-white fill-current" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden transition-all duration-300 min-w-0">
            <span className="font-black text-sm tracking-tight text-foreground truncate">{activeTeam?.name || "Team Space"}</span>
            <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] leading-none opacity-80">Workspace</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 mb-2 group-data-[collapsible=icon]:hidden">
            Team Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-10 rounded-xl transition-all duration-300 group relative overflow-hidden",
                        isActive ? "bg-blue-500/10 text-blue-500 shadow-inner hover:bg-blue-500/15 hover:text-blue-500" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      )}
                    >
                      <Link href={item.url} className="flex items-center w-full group-data-[collapsible=icon]:justify-center">
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full shadow-[0_0_8px_2px_rgba(37,99,235,0.5)]" />
                        )}
                        <item.icon className={cn("size-4 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive && "text-blue-500")} />
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
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-white/5">

      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
