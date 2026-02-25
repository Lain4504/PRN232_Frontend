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
  CreditCard,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useProfile } from "@/lib/contexts/profile-context"
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

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

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
  {
    title: "Gói dịch vụ",
    url: "/dashboard/subscription",
    icon: CreditCard,
  },
]

const systemNavItems: NavItem[] = [
  {
    title: "Nhật ký hệ thống",
    url: "/overview/logs",
    icon: FileText,
  },
]

export function ProfileSidebar() {
  const pathname = usePathname()
  const { activeProfile } = useProfile()
  const isOwner = activeProfile?.isOwner

  const filteredAccountNavItems = accountNavItems.filter(item => {
    if (item.url === "/dashboard/subscription") return isOwner
    return true
  })

  const renderNavGroup = (label: string, items: NavItem[]) => (
    <SidebarGroup>
      <SidebarGroupLabel>
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
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
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
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">OmniAdly</span>
                  <span className="truncate text-xs">Console</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {renderNavGroup("Danh tính", identityNavItems)}
        {renderNavGroup("Tài khoản", filteredAccountNavItems)}
        {renderNavGroup("Hệ thống", systemNavItems)}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
