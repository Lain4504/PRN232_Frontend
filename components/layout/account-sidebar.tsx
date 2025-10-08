"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Settings, Shield, FileText } from "lucide-react"
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
    title: "Preferences",
    url: "/account/me",
    icon: Settings,
  },
  {
    title: "Security",
    url: "/account/security",
    icon: Shield,
  },
]

// Logs navigation items
const logsNavItems: AccountNavItem[] = [
  {
    title: "Audit Logs",
    url: "/account/logs",
    icon: FileText,
  },
]

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full w-64 bg-sidebar border-r border-sidebar-border">
      {/* Back to dashboard */}
      <div className="p-4 border-b border-sidebar-border">
        <Button
          variant="ghost"
          asChild
          className="w-full justify-start text-sm text-sidebar-foreground hover:text-sidebar-foreground"
        >
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Account Section */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider mb-4">
            ACCOUNT
          </h3>
          <div className="space-y-1">
            {accountNavItems.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start text-sm font-normal text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  pathname === item.url && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
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
          <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider mb-4">
            LOGS
          </h3>
          <div className="space-y-1">
            {logsNavItems.map((item) => (
              <Button
                key={item.title}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start text-sm font-normal text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  pathname === item.url && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
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
