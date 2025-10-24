"use client"

import React from "react"
import { usePathname, useParams } from "next/navigation"
import Link from "next/link"
import { useTeam } from '@/lib/contexts/team-context'
import {
  Home,
  FileText,
  Sparkles,
  Package,
  CheckCircle,
  Mail,
  Calendar,
  Users,
  PanelLeftDashed,
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

// Team navigation items with permissions
interface TeamNavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
}

export function TeamSidebar() {
  const pathname = usePathname()
  const params = useParams()
  const teamId = params.teamId as string
  const [sidebarModeState, setSidebarModeState] = React.useState<'expanded' | 'collapsed' | 'hover'>('hover')
  const { hasPermission } = useTeam()

  // Team navigation items with permission checks
  const teamNavItems: TeamNavItem[] = [
    {
      title: "Dashboard",
      url: `/team/${teamId}`,
      icon: Home,
    },
    {
      title: "Content",
      url: `/team/${teamId}/contents`,
      icon: FileText,
      permission: 'CREATE_CONTENT'
    },
    {
      title: "Approvals",
      url: `/team/${teamId}/approval`,
      icon: CheckCircle,
      permission: 'APPROVE_CONTENT'
    },
    {
      title: "AI Generator",
      url: `/team/${teamId}/contents/new`,
      icon: Sparkles,
      permission: 'SUBMIT_AI_GENERATION'
    },
    {
      title: "Products",
      url: `/team/${teamId}/products`,
      icon: Package,
      permission: 'VIEW_PRODUCTS'
    },
    {
      title: "Posts",
      url: `/team/${teamId}/posts`,
      icon: Mail,
      permission: 'VIEW_POSTS'
    },
    {
      title: "Calendar",
      url: `/team/${teamId}/calendar`,
      icon: Calendar,
      permission: 'SCHEDULE_POST'
    },
    {
      title: "Team",
      url: `/team/${teamId}/settings`,
      icon: Users,
      permission: 'VIEW_TEAM_MEMBERS'
    }
  ]

  // Filter menu items based on permissions
  const visibleNavItems = teamNavItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  )

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
            {/* Team Navigation */}
            <div className="mb-6">
              <h3 className={cn(
                "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300",
                sidebarModeState === 'collapsed' && "hidden"
              )}>
                Team Workspace
              </h3>
              {/* Navigation Items */}
              <div className="space-y-1">
                {visibleNavItems.map((item) => (
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

        {/* Footer with mode switcher - hidden on mobile */}
        <div className="p-2 border-t border-sidebar-border hidden lg:block space-y-2">

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
