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
} from "@/components/ui/sidebar"

// Navigation types
interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

export function DashboardSidebar() {

  const pathname = usePathname()
  const { profileType, activeProfile } = useProfile()
  const canUseTeamFeatures = profileType !== ProfileTypeEnum.Free

  const { data: approvalCount = 0 } = usePendingApprovalsCount()

  const mainNavItems: NavItem[] = [
    { title: "Bảng điều khiển", url: "/dashboard", icon: LayoutGrid },
    { title: "Hồ sơ thương hiệu", url: "/dashboard/brands", icon: Target },
    { title: "Chiến dịch quảng cáo", url: "/dashboard/campaigns", icon: Megaphone },
    { title: "Sáng tạo nội dung AI", url: "/dashboard/contents/new", icon: Sparkles },
    { title: "Liên kết mạng xã hội", url: "/dashboard/social-accounts", icon: Share2 },
    { title: "Lịch bài viết", url: "/dashboard/calendar", icon: Calendar },
    { title: "Quản lý bài đăng", url: "/dashboard/posts", icon: Mail },
  ]

  const workflowNavItems: NavItem[] = [
    {
      title: "Phê duyệt nội dung",
      url: "/dashboard/approvals",
      icon: CheckCircle,
      badge: approvalCount > 0 ? approvalCount.toString() : undefined,
    },
    { title: "Quản lý đội ngũ", url: "/dashboard/teams", icon: Users },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar shadow-sm transition-all duration-300">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-sidebar-border bg-sidebar">
        <Link href="/overview" className="flex items-center gap-3 group">
          <div className="size-8 bg-primary rounded-md flex items-center justify-center">
            <Zap className="size-4 text-primary-foreground fill-current" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-base tracking-tight text-sidebar-foreground leading-none">OmniAdly</span>
            <span className="text-[10px] text-muted-foreground mt-1">Bảng điều khiển</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-6 px-3 group-data-[collapsible=icon]:px-1.5 scrollbar-hide bg-sidebar">
        {/* Core Systems Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            HỆ THỐNG CHÍNH
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-12 rounded-2xl transition-all duration-300 group px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xl shadow-sidebar-accent/20 hover:bg-sidebar-accent/80"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className={cn("size-4 shrink-0", isActive && "text-sidebar-accent-foreground")} />
                        <span className="text-sm font-medium truncate group-data-[collapsible=icon]:hidden">
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
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            QUY TRÌNH LÀM VIỆC
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {workflowNavItems
                .filter(item => {
                  if (!canUseTeamFeatures) return false;
                  if (item.url === "/dashboard/teams") {
                    const managementRoles = ['Vendor', 'TeamLeader'];
                    return activeProfile?.isOwner || (activeProfile?.memberRole && managementRoles.includes(activeProfile.memberRole));
                  }
                  return true;
                })
                .map((item) => {
                  const isActive = pathname.startsWith(item.url)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "transition-all duration-300 group group-data-[collapsible=icon]:justify-center",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <Link href={item.url} className="flex items-center gap-3 w-full relative">
                          <item.icon className={cn("size-4 shrink-0", isActive && "text-sidebar-accent-foreground")} />
                          <span className="text-sm font-medium truncate group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                          {item.badge && (
                            <div className="absolute top-0 right-0 size-4 bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center rounded-full border-2 border-sidebar translate-x-1 -translate-y-1 group-data-[collapsible=icon]:hidden">
                              {item.badge}
                            </div>
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

      <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar group-data-[collapsible=icon]:p-2 min-h-12 flex items-center">
        <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:px-0">
          <div className="size-2 rounded-full bg-success animate-pulse group-data-[collapsible=icon]:hidden" />
          <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">Server: Online</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
