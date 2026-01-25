"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useProfile } from '@/lib/contexts/profile-context'
import { ProfileTypeEnum } from '@/lib/utils/profile-utils'
import { usePendingApprovalsCount } from '@/hooks/use-approvals'
import { useTranslation } from 'react-i18next'
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
} from "@/components/ui/sidebar"

// Navigation types
interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

export function DashboardSidebar() {
  const { t } = useTranslation("common")
  const pathname = usePathname()
  const { hasFeatureAccess, profileType } = useProfile()
  const canUseTeamFeatures = profileType !== ProfileTypeEnum.Free

  const { data: approvalCount = 0 } = usePendingApprovalsCount()

  const mainNavItems: NavItem[] = [
    { title: t("sidebar.commandCenter"), url: "/dashboard", icon: LayoutGrid },
    { title: t("sidebar.identityMatrix"), url: "/dashboard/brands", icon: Target },
    { title: t("sidebar.activeSignals"), url: "/dashboard/campaigns", icon: Megaphone },
    { title: t("sidebar.neuralForge"), url: "/dashboard/contents/new", icon: Sparkles },
    { title: t("sidebar.connectors"), url: "/dashboard/social-accounts", icon: Share2 },
    { title: t("sidebar.temporalGrid"), url: "/dashboard/calendar", icon: Calendar },
    { title: t("sidebar.broadcasts"), url: "/dashboard/posts", icon: Mail },
  ]

  const workflowNavItems: NavItem[] = [
    {
      title: t("sidebar.governance"),
      url: "/dashboard/approvals",
      icon: CheckCircle,
      badge: approvalCount > 0 ? approvalCount.toString() : undefined,
    },
    { title: t("sidebar.operatives"), url: "/dashboard/teams", icon: Users },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-100 bg-white shadow-sm transition-all duration-300">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-slate-100">
        <Link href="/overview" className="flex items-center gap-3 group">
          <div className="size-8 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 transition-transform group-hover:scale-110">
            <Zap className="size-4 text-white fill-current" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-black text-lg tracking-tighter text-slate-900 leading-none">omniadly</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Dashboard</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-6 px-3 group-data-[collapsible=icon]:px-2">
        {/* Core Systems Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 mb-4 group-data-[collapsible=icon]:hidden">
            Hệ thống chính
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-11 rounded-xl transition-all duration-200 group px-3",
                        isActive
                          ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={cn("size-4.5 shrink-0 transition-transform", isActive ? "text-white" : "group-hover:scale-110")} />
                        <span className="font-bold text-xs uppercase tracking-widest truncate group-data-[collapsible=icon]:hidden">
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

        {/* Workflow Group */}
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 mb-4 group-data-[collapsible=icon]:hidden">
            Quy trình làm việc
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {workflowNavItems
                .filter(item => item.title !== "Operatives" || hasFeatureAccess('teams'))
                .map((item) => {
                  const isActive = pathname.startsWith(item.url)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "h-11 rounded-xl transition-all duration-200 group px-3",
                          isActive
                            ? "bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                      >
                        <Link href={item.url} className="flex items-center gap-3">
                          <item.icon className={cn("size-4.5 shrink-0 transition-transform", isActive ? "text-white" : "group-hover:scale-110")} />
                          <span className="font-bold text-xs uppercase tracking-widest truncate group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                          {item.badge && (
                            <SidebarMenuBadge className="bg-rose-500 text-white font-black text-[9px] size-5 rounded-full border-2 border-white group-data-[collapsible=icon]:hidden">
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

      <SidebarFooter className="p-4 border-t border-slate-50 group-data-[collapsible=icon]:p-2">
        {/* Footer can be used for help or collapse toggle info */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
