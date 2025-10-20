"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useUser } from '@/hooks/use-user'
import { useQuery } from '@tanstack/react-query'
import { api, endpoints } from '@/lib/api'
import {
  Home,
  Settings,
  BarChart3,
  FileText,
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
  HelpCircle,
  BookOpen,
  Megaphone,
  CreditCard,
  Sparkles,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CompactSubscriptionStatus } from "@/components/subscription/subscription-status-indicator"
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
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: TrendingUp,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: BarChart3,
  }
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
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: Bell,
    badge: notificationCount > 0 ? notificationCount.toString() : undefined,
  }
]

// System and Support Navigation
const secondaryNavItems: NavItem[] = [
  {
    title: "Subscription",
    url: "/subscription",
    icon: CreditCard,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Account",
    url: "/account/me",
    icon: User,
  },
  {
    title: "Help & Support",
    url: "/dashboard/help",
    icon: HelpCircle,
  },
  {
    title: "Documentation",
    url: "/dashboard/docs",
    icon: BookOpen,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [sidebarModeState, setSidebarModeState] = React.useState<'expanded' | 'collapsed' | 'hover'>('hover')
  const { data: user } = useUser()
  const userRole = user?.role || null

  // API calls for notifications and approvals
  const { data: approvalCount = 0 } = useQuery({
    queryKey: ['approvals', 'pending', 'count'],
    queryFn: async () => {
      try {
        const response = await api.get<{ data: number }>('/approvals/pending/count')
        return response.data.data ?? 0
      } catch (error) {
        console.error('Error fetching approval count:', error)
        return 0
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })

  const { data: notificationCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread', 'count'],
    queryFn: async () => {
      try {
        const response = await api.get<{ data: number }>('/notifications/unread/count')
        return response.data.data ?? 0
      } catch (error) {
        console.error('Error fetching notification count:', error)
        return 0
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })

  const workflowNavItems = getWorkflowNavItems(approvalCount, notificationCount)

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
      <div className="flex flex-col h-full">
        {/* CSS để ẩn scrollbar */}
        <style jsx>{`
          .sidebar-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {/* Navigation Content */}
        <div
          className="flex-1 overflow-y-auto sidebar-scroll"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="p-2 lg:p-2">
            {/* Main Navigation */}
            <div className="mb-6">
              <h3 className={cn(
                "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300",
                sidebarModeState === 'collapsed' && "hidden"
              )}>
                Main Navigation
              </h3>
              {/* Main Navigation Items */}
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                    <Tooltip key={item.title}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          asChild
                          className={cn(
                            "relative w-full h-8 lg:h-8 px-2",
                            sidebarModeState === 'expanded' && "justify-start",
                            sidebarModeState === 'collapsed' && "lg:justify-center",
                            sidebarModeState === 'hover' && "lg:justify-center lg:group-hover:justify-start",
                            pathname === item.url && "bg-accent"
                          )}
                        >
                          <Link href={item.url}>
                            <item.icon className={cn(
                              "size-4",
                              sidebarModeState === 'expanded' && "mr-2",
                              sidebarModeState === 'hover' && "lg:mr-0 lg:group-hover:mr-2"
                            )} />
                            <span className={cn(
                              "transition-opacity duration-300 whitespace-nowrap",
                              sidebarModeState === 'expanded' && "inline",
                              sidebarModeState === 'collapsed' && "hidden",
                              sidebarModeState === 'hover' && "hidden lg:group-hover:inline"
                            )}>
                              {item.title}
                            </span>
                            {item.badge && (
                              <>
                                {sidebarModeState === 'collapsed' && (
                                  <span className="absolute right-0 top-1 hidden lg:inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white">
                                    {item.badge}
                                  </span>
                                )}
                                {sidebarModeState === 'hover' && (
                                  <>
                                    <span className="absolute right-0 top-1 hidden lg:inline-flex lg:group-hover:hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white">
                                      {item.badge}
                                    </span>
                                    <span className="ml-auto hidden lg:group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                      {item.badge}
                                    </span>
                                  </>
                                )}
                                {sidebarModeState === 'expanded' && (
                                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    {item.badge}
                                  </span>
                                )}
                              </>
                            )}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className={cn("lg:block hidden", sidebarModeState === 'expanded' && "hidden")}>
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
              </div>
            </div>

            {/* Workflow Navigation */}
            <div className="mb-6">
              <h3 className={cn(
                "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300",
                sidebarModeState === 'collapsed' && "hidden"
              )}>
                Workflow
              </h3>
              <div className="space-y-1">
                {workflowNavItems
                  .filter((item) => {
                    // Hide Teams menu if user is not Vendor
                    if (item.title === "Team") {
                      return userRole === "Vendor"
                    }
                    return true
                  })
                  .map((item) => (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        asChild
                        className={cn(
                          "relative w-full h-8 lg:h-8 px-2",
                          sidebarModeState === 'expanded' && "justify-start",
                          sidebarModeState === 'collapsed' && "lg:justify-center",
                          sidebarModeState === 'hover' && "lg:justify-center lg:group-hover:justify-start",
                          pathname === item.url && "bg-accent"
                        )}
                      >
                        <Link href={item.url}>
                          <item.icon className={cn(
                            "size-4",
                            sidebarModeState === 'expanded' && "mr-2",
                            sidebarModeState === 'hover' && "lg:mr-0 lg:group-hover:mr-2"
                          )} />
                          <span className={cn(
                            "transition-opacity duration-300 whitespace-nowrap",
                            sidebarModeState === 'expanded' && "inline",
                            sidebarModeState === 'collapsed' && "hidden",
                            sidebarModeState === 'hover' && "hidden lg:group-hover:inline"
                          )}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <>
                              {sidebarModeState === 'collapsed' && (
                                <span className="absolute right-0 top-1 hidden lg:inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white">
                                  {item.badge}
                                </span>
                              )}
                              {sidebarModeState === 'hover' && (
                                <>
                                  <span className="absolute right-0 top-1 hidden lg:inline-flex lg:group-hover:hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white">
                                    {item.badge}
                                  </span>
                                  <span className="ml-auto hidden lg:group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    {item.badge}
                                  </span>
                                </>
                              )}
                              {sidebarModeState === 'expanded' && (
                                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className={cn("lg:block hidden", sidebarModeState === 'expanded' && "hidden")}>
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className={cn(
              "border-t border-sidebar-border my-4 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300",
              sidebarModeState === 'collapsed' && "hidden"
            )} />

            {/* System Navigation */}
            <div className="mb-4">
              <h3 className={cn(
                "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300",
                sidebarModeState === 'collapsed' && "hidden"
              )}>
                System
              </h3>
              <div className="space-y-1">
                {secondaryNavItems.map((item) => (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        asChild
                        className={cn(
                          "relative w-full h-8 lg:h-8 px-2",
                          sidebarModeState === 'expanded' && "justify-start",
                          sidebarModeState === 'collapsed' && "lg:justify-center",
                          sidebarModeState === 'hover' && "lg:justify-center lg:group-hover:justify-start",
                          pathname === item.url && "bg-accent"
                        )}
                      >
                        <Link href={item.url}>
                          <item.icon className={cn(
                            "size-4",
                            sidebarModeState === 'expanded' && "mr-2",
                            sidebarModeState === 'hover' && "lg:mr-0 lg:group-hover:mr-2"
                          )} />
                          <span className={cn(
                            "transition-opacity duration-300 whitespace-nowrap",
                            sidebarModeState === 'expanded' && "inline",
                            sidebarModeState === 'collapsed' && "hidden",
                            sidebarModeState === 'hover' && "hidden lg:group-hover:inline"
                          )}>
                            {item.title}
                          </span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className={cn("lg:block hidden", sidebarModeState === 'expanded' && "hidden")}>
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with subscription status and mode switcher - hidden on mobile */}
        <div className="p-2 border-t border-sidebar-border hidden lg:block space-y-2">
          {/* Subscription Status */}
          <div className="px-2">
            <CompactSubscriptionStatus />
          </div>

          {/* Mode Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full h-10 lg:h-10 px-2 lg:justify-center">
                <PanelLeftDashed className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="center" className="min-w-48">
              <DropdownMenuLabel>Sidebar mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSidebarMode('expanded')}>Expanded</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSidebarMode('collapsed')}>Collapsed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSidebarMode('hover')}>Expand on hover</DropdownMenuItem>
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  )
}