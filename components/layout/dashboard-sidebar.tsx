"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useProfile } from '@/lib/contexts/profile-context'
import { ProfileTypeEnum } from '@/lib/utils/profile-utils'
import { usePendingApprovalsCount } from '@/hooks/use-approvals'
import {
  Calendar,
  Target,
  CheckCircle,
  Share2,
  Users,
  Megaphone,
  Sparkles,
  LayoutGrid,
  Zap,
  Mail,
  PanelLeft
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"

// Navigation types
interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const mainNavItems: NavItem[] = [
  { title: "Command Center", url: "/dashboard", icon: LayoutGrid },
  { title: "Identity Matrix", url: "/dashboard/brands", icon: Target },
  { title: "Active Signals", url: "/dashboard/campaigns", icon: Megaphone },
  { title: "Neural Forge", url: "/dashboard/contents/new", icon: Sparkles },
  { title: "Connectors", url: "/dashboard/social-accounts", icon: Share2 },
  { title: "Temporal Grid", url: "/dashboard/calendar", icon: Calendar },
  { title: "Broadcasts", url: "/dashboard/posts", icon: Mail },
]

const getWorkflowNavItems = (approvalCount: number): NavItem[] => [
  {
    title: "Governance",
    url: "/dashboard/approvals",
    icon: CheckCircle,
    badge: approvalCount > 0 ? approvalCount.toString() : undefined,
  },
  { title: "Operatives", url: "/dashboard/teams", icon: Users },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { hasFeatureAccess, profileType } = useProfile()
  const canUseTeamFeatures = profileType !== ProfileTypeEnum.Free
  const { state } = useSidebar()

  const { data: approvalCount = 0 } = usePendingApprovalsCount()
  const workflowNavItems = canUseTeamFeatures
    ? getWorkflowNavItems(approvalCount)
    : getWorkflowNavItems(approvalCount).filter(item => item.title !== "Governance")

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

      <SidebarContent className="px-2 py-4">
        {/* Core Systems Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 mb-2 group-data-[collapsible=icon]:hidden">
            Core Systems
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-10 rounded-xl transition-all duration-300 group relative overflow-hidden",
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

        {/* Admin Protocol Group */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 mb-2 group-data-[collapsible=icon]:hidden">
            Admin Protocol
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowNavItems
                .filter(item => item.title !== "Operatives" || hasFeatureAccess('teams'))
                .map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "h-10 rounded-xl transition-all duration-300 group relative overflow-hidden",
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
                          {item.badge && (
                            <SidebarMenuBadge className="bg-primary text-primary-foreground font-black text-[9px] size-5 rounded-full shadow-lg shadow-primary/20 group-data-[collapsible=icon]:top-0 group-data-[collapsible=icon]:right-0 group-data-[collapsible=icon]:size-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:text-transparent">
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
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