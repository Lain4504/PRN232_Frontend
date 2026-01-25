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
}

// Identity navigation items
const identityNavItems: NavItem[] = [
  {
    title: "Hồ sơ của tôi",
    url: "/overview",
    icon: User,
  },
  {
    title: "Nhóm của tôi",
    url: "/overview/teams",
    icon: Users,
  }
]

// Account navigation items
const accountNavItems: NavItem[] = [
  {
    title: "Tùy chỉnh",
    url: "/overview/account",
    icon: Settings,
  },
  {
    title: "Bảo mật",
    url: "/overview/security",
    icon: Shield,
  },
  {
    title: "Lịch sử thanh toán",
    url: "/overview/payment",
    icon: History,
  },
]

// System navigation items
const systemNavItems: NavItem[] = [
  {
    title: "Nhật ký hệ thống",
    url: "/overview/logs",
    icon: FileText,
  },
]

export function ProfileSidebar() {
  const pathname = usePathname()

  const renderNavGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2 group-data-[collapsible=icon]:hidden">
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
                    "h-10 rounded-xl transition-all duration-200 group relative",
                    isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800 hover:text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Link href={item.url} className="flex items-center w-full px-3">
                    <item.icon className={cn("size-4 shrink-0 transition-transform duration-200", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
                    <span className="font-bold text-sm truncate ml-3 group-data-[collapsible=icon]:hidden">
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
    <Sidebar collapsible="icon" className="border-r border-slate-100 bg-white">
      <SidebarHeader className="h-16 flex items-center border-b border-slate-50 px-6">
        <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center w-full overflow-hidden">
          <div className="size-8 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
            <Zap className="size-4 text-white fill-current" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-lg tracking-tight text-slate-900 leading-none">omniadly</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Console</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="py-6 px-3 group-data-[collapsible=icon]:px-2 gap-6">
        {renderNavGroup("Danh tính", identityNavItems)}
        {renderNavGroup("Tài khoản", accountNavItems)}
        {renderNavGroup("Hệ thống", systemNavItems)}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
