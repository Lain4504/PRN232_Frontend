"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Settings, Shield, FileText, History } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AccountNavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

// Account navigation items
const accountNavItems: AccountNavItem[] = [
  {
    title: "Tùy chỉnh",
    url: "/account/me",
    icon: Settings,
  },
  {
    title: "Bảo mật",
    url: "/account/security",
    icon: Shield,
  },
  {
    title: "Lịch sử thanh toán",
    url: "/account/payment",
    icon: History,
  },
]

// Logs navigation items
const logsNavItems: AccountNavItem[] = [
  {
    title: "Nhật ký hệ thống",
    url: "/account/logs",
    icon: FileText,
  },
]

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full w-64 bg-sidebar border-r border-sidebar-border">
      {/* Back to dashboard */}
      {/* Back to dashboard */}
      <div className="p-4 border-b border-sidebar-border">
        <Button
          variant="ghost"
          asChild
          className="w-full justify-start text-sm text-sidebar-foreground"
        >
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại bảng điều khiển
          </Link>
        </Button>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Account Section */}
        <div className="mb-6">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            TÀI KHOẢN
          </h3>
          <div className="space-y-1">
            {accountNavItems.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start text-sm font-medium",
                  pathname === item.url
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Link href={item.url}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Logs Section */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            NHẬT KÝ
          </h3>
          <div className="space-y-1">
            {logsNavItems.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start text-sm font-medium",
                  pathname === item.url
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Link href={item.url}>
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
