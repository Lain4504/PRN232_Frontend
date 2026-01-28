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

  const pathname = usePathname()
  const { hasFeatureAccess, profileType, activeProfile } = useProfile()
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
    <Sidebar collapsible="icon" className="border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
      <SidebarHeader className="h-16 flex items-center px-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <Link href="/overview" className="flex items-center gap-3 group">
          <div className="size-8 bg-slate-900 dark:bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-slate-200/50 dark:shadow-primary/20 transition-transform group-hover:scale-110">
            <Zap className="size-4 text-white fill-current" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-black text-lg tracking-tighter text-slate-900 dark:text-white leading-none">OmniAdly</span>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">Bảng điều khiển</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-6 px-3 group-data-[collapsible=icon]:px-1.5 scrollbar-hide bg-white dark:bg-slate-900">
        {/* Core Systems Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 px-3 mb-5 group-data-[collapsible=icon]:hidden">
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
                          ? "bg-slate-900 dark:bg-primary text-white shadow-xl shadow-slate-200 dark:shadow-primary/20 hover:bg-slate-800 dark:hover:bg-primary/90 hover:text-white"
                          : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3 w-full">
                        <item.icon className={cn("size-5 shrink-0 transition-transform duration-300", isActive ? "text-white scale-110" : "group-hover:scale-110")} />
                        <span className="font-black text-[10px] uppercase tracking-widest truncate group-data-[collapsible=icon]:hidden">
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
        <SidebarGroup className="mt-10">
          <SidebarGroupLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600 px-3 mb-5 group-data-[collapsible=icon]:hidden">
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
                          "h-12 rounded-2xl transition-all duration-300 group px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center",
                          isActive
                            ? "bg-slate-900 dark:bg-primary text-white shadow-xl shadow-slate-200 dark:shadow-primary/20 hover:bg-slate-800 dark:hover:bg-primary/90 hover:text-white"
                            : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        <Link href={item.url} className="flex items-center gap-3 w-full relative">
                          <item.icon className={cn("size-5 shrink-0 transition-transform duration-300", isActive ? "text-white scale-110" : "group-hover:scale-110")} />
                          <span className="font-black text-[10px] uppercase tracking-widest truncate group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                          {item.badge && (
                            <div className="absolute top-0 right-0 size-5 bg-rose-500 text-white font-black text-[8px] flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 translate-x-2 -translate-y-2 shadow-sm group-data-[collapsible=icon]:hidden">
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

      <SidebarFooter className="p-4 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 group-data-[collapsible=icon]:p-2 min-h-16 flex items-center">
        <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:px-0">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse group-data-[collapsible=icon]:hidden" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 group-data-[collapsible=icon]:hidden">Server: Online</span>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
