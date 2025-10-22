"use client"

import React from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomTabs } from "@/components/ui/custom-tabs"

// Account navigation items
const accountNavItems = [
  {
    label: "Preferences",
    value: "preferences",
    url: "/account/me"
  },
  {
    label: "Security", 
    value: "security",
    url: "/account/security"
  },
  {
    label: "Audit Logs",
    value: "logs", 
    url: "/account/logs"
  },
]

export function AccountMobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  // Determine active tab based on current pathname
  const getActiveTab = () => {
    if (pathname === "/account/me") return "preferences"
    if (pathname === "/account/security") return "security" 
    if (pathname === "/account/logs") return "logs"
    return "preferences"
  }

  const handleTabChange = (value: string) => {
    const item = accountNavItems.find(item => item.value === value)
    if (item) {
      router.push(item.url)
    }
  }

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
        <CustomTabs
          items={accountNavItems}
          activeTab={getActiveTab()}
          onTabChange={handleTabChange}
          className="mb-0"
        />
      </div>
    </div>
  )
}
