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
      <div className="flex flex-col h-full bg-sidebar/50 backdrop-blur-md">
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
          <div className="space-y-10">
            {/* Main Navigation */}
            <div className="space-y-4">
              <h3 className={cn(
                "px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] transition-all duration-300",
                sidebarModeState === 'collapsed' && "opacity-0 translate-x-[-10px]"
              )}>
                Menu
              </h3>
              <div className="space-y-1.5">
                {mainNavItems.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <Tooltip key={item.title}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          asChild
                          className={cn(
                            "relative w-full h-10 lg:h-12 px-3 rounded-xl transition-all duration-300",
                            sidebarModeState === 'expanded' && "justify-start",
                            sidebarModeState === 'collapsed' && "lg:justify-center",
                            sidebarModeState === 'hover' && "lg:justify-center lg:group-hover:justify-start",
                            isActive
                              ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                              : "hover:bg-primary/5 hover:text-foreground text-muted-foreground"
                          )}
                        >
                          <Link href={item.url}>
                            <item.icon className={cn(
                              "size-5 stroke-[2.5]",
                              sidebarModeState === 'expanded' && "mr-3",
                              sidebarModeState === 'hover' && "lg:mr-0 lg:group-hover:mr-3"
                            )} />
                            <span className={cn(
                              "transition-all duration-300 whitespace-nowrap font-black uppercase tracking-widest text-[10px]",
                              sidebarModeState === 'expanded' && "inline opacity-100 translate-x-0",
                              sidebarModeState === 'collapsed' && "hidden opacity-0 -translate-x-4",
                              sidebarModeState === 'hover' && "hidden opacity-0 -translate-x-4 lg:group-hover:inline lg:group-hover:opacity-100 lg:group-hover:translate-x-0"
                            )}>
                              {item.title}
                            </span>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className={cn("lg:block hidden bg-popover/80 backdrop-blur-xl border-border/40 font-black uppercase text-[10px] tracking-widest", sidebarModeState === 'expanded' && "hidden")}>
                        <p>{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>

            {/* Workflow Navigation */}
            <div className="space-y-4">
              <h3 className={cn(
                "px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] transition-all duration-300",
                sidebarModeState === 'collapsed' && "opacity-0 translate-x-[-10px]"
              )}>
                Workflow
              </h3>
              <div className="space-y-1.5">
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
                              "relative w-full h-10 lg:h-12 px-3 rounded-xl transition-all duration-300",
                              sidebarModeState === 'expanded' && "justify-start",
                              sidebarModeState === 'collapsed' && "lg:justify-center",
                              sidebarModeState === 'hover' && "lg:justify-center lg:group-hover:justify-start",
                              isActive
                                ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                                : "hover:bg-primary/5 hover:text-foreground text-muted-foreground"
                            )}
                          >
                            <Link href={item.url}>
                              <item.icon className={cn(
                                "size-5 stroke-[2.5]",
                                sidebarModeState === 'expanded' && "mr-3",
                                sidebarModeState === 'hover' && "lg:mr-0 lg:group-hover:mr-3"
                              )} />
                              <span className={cn(
                                "transition-all duration-300 whitespace-nowrap font-black uppercase tracking-widest text-[10px]",
                                sidebarModeState === 'expanded' && "inline opacity-100 translate-x-0",
                                sidebarModeState === 'collapsed' && "hidden opacity-0 -translate-x-4",
                                sidebarModeState === 'hover' && "hidden opacity-0 -translate-x-4 lg:group-hover:inline lg:group-hover:opacity-100 lg:group-hover:translate-x-0"
                              )}>
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className={cn(
                                  "absolute right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/20 px-1 text-[10px] font-black text-primary backdrop-blur-sm shadow-sm transition-all duration-300",
                                  sidebarModeState === 'collapsed' && "scale-50 translate-x-2 translate-y-[-2]",
                                  sidebarModeState === 'hover' && "scale-50 translate-x-2 lg:group-hover:scale-100 lg:group-hover:translate-x-0",
                                  isActive && "bg-background/20 text-primary-foreground"
                                )}>
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className={cn("lg:block hidden bg-popover/80 backdrop-blur-xl border-border/40 font-black uppercase text-[10px] tracking-widest", sidebarModeState === 'expanded' && "hidden")}>
                          <p className="font-bold">{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/40 space-y-4">
          {/* Mode Switcher */}
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-muted transition-colors">
                  <PanelLeftDashed className="size-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56 p-2 rounded-xl border-border/40 bg-background/95 backdrop-blur-xl">
                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Interface Preference</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSidebarMode('expanded')} className="rounded-xl px-3 py-2 cursor-pointer">
                  Standard Mode
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSidebarMode('collapsed')} className="rounded-xl px-3 py-2 cursor-pointer">
                  Minimized Mode
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSidebarMode('hover')} className="rounded-xl px-3 py-2 cursor-pointer font-bold text-primary italic">
                  Dynamic Adaptive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}