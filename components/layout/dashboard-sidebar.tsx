"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useProfile } from '@/lib/contexts/profile-context'
import { ProfileTypeEnum } from '@/lib/utils/profile-utils'
import { usePendingApprovalsCount } from '@/hooks/use-approvals'
import { useUnreadNotificationsCount } from '@/hooks/use-notifications'
import {
  Home,
  BarChart3,
  Calendar,
  Mail,
  User,
  Target,
  CheckCircle,
  Share2,
  PanelLeftDashed,
  Users,
  TrendingUp,
  Bell,
  Megaphone,
  CreditCard,
  Sparkles,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Dữ liệu menu chính - đơn giản hóa không có sub items
interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Brands",
    url: "/dashboard/brands",
    icon: Target,
  },
  {
    title: "Campaigns",
    url: "/dashboard/campaigns",
    icon: Megaphone,
  },
  {
    title: "AI Generator",
    url: "/dashboard/contents/new",
    icon: Sparkles,
  },
  {
    title: "Social Accounts",
    url: "/dashboard/social-accounts",
    icon: Share2,
  },
  {
    title: "Calendar",
    url: "/dashboard/calendar",
    icon: Calendar,
  },
  {
    title: "Posts",
    url: "/dashboard/posts",
    icon: Mail,
  },
]

// Dynamic workflow items with API data
const getWorkflowNavItems = (approvalCount: number, notificationCount: number): NavItem[] => [
  {
    title: "Approvals",
    url: "/dashboard/approvals",
    icon: CheckCircle,
    badge: approvalCount > 0 ? approvalCount.toString() : undefined,
  },
  {
    title: "Team",
    url: "/dashboard/teams",
    icon: Users,
  },
]

// System and Support Navigation
const secondaryNavItems: NavItem[] = [
  {
    title: "Subscription",
    url: "/dashboard/subscription",
    icon: CreditCard,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [sidebarModeState, setSidebarModeState] = React.useState<'expanded' | 'collapsed' | 'hover'>('hover')
  const { hasFeatureAccess, profileType } = useProfile()
  const canUseTeamFeatures = profileType !== ProfileTypeEnum.Free

  // API calls for notifications and approvals (via hooks)
  // Only fetch approval count for Basic/Pro profiles (conditional hook call)
  const shouldFetchApprovals = canUseTeamFeatures
  const { data: approvalCount = 0 } = usePendingApprovalsCount()
  const { data: notificationCount = 0 } = useUnreadNotificationsCount()

  // Filter workflow items: hide Approvals for Free profiles
  const allWorkflowNavItems = getWorkflowNavItems(approvalCount, notificationCount)
  const workflowNavItems = canUseTeamFeatures
    ? allWorkflowNavItems
    : allWorkflowNavItems.filter(item => item.title !== "Approvals")

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (isMobile) {
      // Force expanded on mobile
      setSidebarModeState('expanded')
    } else {
      const stored = localStorage.getItem('sidebarMode') as 'expanded' | 'collapsed' | 'hover' | null
      if (stored === 'expanded' || stored === 'collapsed' || stored === 'hover') {
        setSidebarModeState(stored)
      }
    }

    const onModeChange = (e: CustomEvent<'expanded' | 'collapsed' | 'hover'>) => {
      const mode = e.detail
      const nowMobile = window.matchMedia('(max-width: 1023px)').matches
      if (nowMobile) {
        // Ignore external mode changes on mobile; keep expanded
        setSidebarModeState('expanded')
        return
      }
      if (mode === 'expanded' || mode === 'collapsed' || mode === 'hover') {
        setSidebarModeState(mode)
        // Also update localStorage to keep it in sync
        localStorage.setItem('sidebarMode', mode)
      }
    }

    const mq = window.matchMedia('(max-width: 1023px)')
    const onMqChange = () => {
      if (mq.matches) {
        setSidebarModeState('expanded')
      } else {
        const stored = localStorage.getItem('sidebarMode') as 'expanded' | 'collapsed' | 'hover' | null
        setSidebarModeState(stored || 'hover')
      }
    }

    mq.addEventListener?.('change', onMqChange)
    window.addEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
    return () => {
      mq.removeEventListener?.('change', onMqChange)
      window.removeEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
    }
  }, [])

  // Custom sidebar với hover expand effect
  const setSidebarMode = (mode: 'expanded' | 'collapsed' | 'hover') => {
    if (typeof window !== 'undefined') {
      const isMobile = window.matchMedia('(max-width: 1023px)').matches
      if (isMobile) return // Do not allow changing mode on mobile
      localStorage.setItem('sidebarMode', mode)
      setSidebarModeState(mode) // Update local state immediately
      window.dispatchEvent(new CustomEvent('sidebar-mode-change', { detail: mode }))
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-card border-r">
        {/* CSS for custom styling */}
        <style jsx>{`
          .sidebar-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Navigation Content */}
        <div
          className="flex-1 overflow-y-auto sidebar-scroll px-3 py-6"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="space-y-8">
            {/* Main Navigation */}
            <div className="space-y-3">
              <h3 className={cn(
                "px-3 text-xs font-semibold text-muted-foreground transition-all duration-300",
                sidebarModeState === 'collapsed' && "opacity-0"
              )}>
                Platform
              </h3>
              <div className="space-y-1">
                {mainNavItems.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <Tooltip key={item.title}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          asChild
                          className={cn(
                            "relative w-full h-10 px-3 rounded-lg transition-all duration-200",
                            sidebarModeState === 'expanded' && "justify-start",
                            sidebarModeState === 'collapsed' && "lg:justify-center",
                            sidebarModeState === 'hover' && "lg:justify-center lg:group-hover:justify-start",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          <Link href={item.url}>
                            <item.icon className={cn(
                              "h-5 w-5",
                              sidebarModeState === 'expanded' && "mr-3",
                              sidebarModeState === 'hover' && "lg:mr-0 lg:group-hover:mr-3"
                            )} />
                            <span className={cn(
                              "transition-all duration-200 whitespace-nowrap text-sm",
                              sidebarModeState === 'expanded' && "inline opacity-100",
                              sidebarModeState === 'collapsed' && "hidden opacity-0",
                              sidebarModeState === 'hover' && "hidden opacity-0 lg:group-hover:inline lg:group-hover:opacity-100"
                            )}>
                              {item.title}
                            </span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className={cn("lg:block hidden", sidebarModeState === 'expanded' && "hidden")}>
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>

            {/* Workflow Navigation */}
            <div className="space-y-3">
              <h3 className={cn(
                "px-3 text-xs font-semibold text-muted-foreground transition-all duration-300",
                sidebarModeState === 'collapsed' && "opacity-0"
              )}>
                Management
              </h3>
              <div className="space-y-1">
                {workflowNavItems
                  .filter((item) => {
                    if (item.title === "Team") return hasFeatureAccess('teams')
                    return true
                  })
                  .map((item) => {
                    const isActive = pathname === item.url
                    return (
                      <Tooltip key={item.title}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            asChild
                            className={cn(
                              "relative w-full h-10 px-3 rounded-lg transition-all duration-200",
                              sidebarModeState === 'expanded' && "justify-start",
                              sidebarModeState === 'collapsed' && "lg:justify-center",
                              sidebarModeState === 'hover' && "lg:justify-center lg:group-hover:justify-start",
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                          >
                            <Link href={item.url}>
                              <item.icon className={cn(
                                "h-5 w-5",
                                sidebarModeState === 'expanded' && "mr-3",
                                sidebarModeState === 'hover' && "lg:mr-0 lg:group-hover:mr-3"
                              )} />
                              <span className={cn(
                                "transition-all duration-200 whitespace-nowrap text-sm",
                                sidebarModeState === 'expanded' && "inline opacity-100",
                                sidebarModeState === 'collapsed' && "hidden opacity-0",
                                sidebarModeState === 'hover' && "hidden opacity-0 lg:group-hover:inline lg:group-hover:opacity-100"
                              )}>
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className={cn(
                                  "absolute right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/20 px-1 text-[10px] font-bold text-primary",
                                  sidebarModeState === 'collapsed' && "scale-50",
                                  sidebarModeState === 'hover' && "scale-50 lg:group-hover:scale-100",
                                  isActive && "bg-background/20"
                                )}>
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className={cn("lg:block hidden", sidebarModeState === 'expanded' && "hidden")}>
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t">
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarMode(sidebarModeState === 'expanded' ? 'collapsed' : 'expanded')}
              className="text-muted-foreground"
            >
              <PanelLeftDashed className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}