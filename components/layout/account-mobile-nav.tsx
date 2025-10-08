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
  value: string
}

// Account navigation items
const accountNavItems: AccountNavItem[] = [
  {
    title: "Preferences",
    url: "/account/me",
    icon: Settings,
    value: "preferences"
  },
  {
    title: "Security",
    url: "/account/security",
    icon: Shield,
    value: "security"
  },
  {
    title: "Audit Logs",
    url: "/account/logs",
    icon: FileText,
    value: "logs"
  },
]

export function AccountMobileNav() {
  const pathname = usePathname()

  return (
    <div className="lg:hidden border-b border-border bg-background">
      {/* Back to dashboard */}
      <div className="p-4 border-b border-border">
        <Button
          variant="ghost"
          asChild
          className="w-full justify-start text-sm"
        >
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>

      {/* Mobile Tabs Navigation */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-lg">
          {accountNavItems.map((item) => (
            <Button
              key={item.value}
              variant="ghost"
              asChild
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-1 text-xs",
                pathname === item.url && "bg-background shadow-sm"
              )}
            >
              <Link href={item.url} className="flex flex-col items-center gap-1">
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.title}</span>
                <span className="sm:hidden">{item.title.split(' ')[0]}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
