"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useProfile } from '@/lib/contexts/profile-context'
import { ProfileTypeEnum } from '@/lib/utils/profile-utils'
import { usePendingApprovalsCount } from '@/hooks/use-approvals'
import {
  Home,
  Calendar,
  Mail,
  Target,
  CheckCircle,
  Share2,
  PanelLeftDashed,
  Users,
  Megaphone,
  Sparkles,
  Layers,
  LayoutGrid
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Navigation types
interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const mainNavItems: NavItem[] = [
  { title: "Command Center", url: "/dashboard", icon: LayoutGrid },
  { title: "Identity Matrix", url: "/dashboard/brands", icon: Target },
  { title: "Active Signals", url: "/dashboard/campaigns", icon: Megaphone },
  { title: "Neural Forge", url: "/dashboard/contents/new", icon: Sparkles },
  { title: "Connectors", url: "/dashboard/social-accounts", icon: Share2 },
  { title: "Temporal Grid", url: "/dashboard/calendar", icon: Calendar },
  { title: "Broadcasts", url: "/dashboard/posts", icon: Mail },
]

const getWorkflowNavItems = (approvalCount: number): NavItem[] => [
  {
    title: "Governance",
    url: "/dashboard/approvals",
    icon: CheckCircle,
    badge: approvalCount > 0 ? approvalCount.toString() : undefined,
  },
  { title: "Operatives", url: "/dashboard/teams", icon: Users },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [sidebarModeState, setSidebarModeState] = React.useState<'expanded' | 'collapsed' | 'hover'>('hover')
  const { hasFeatureAccess, profileType } = useProfile()
  const canUseTeamFeatures = profileType !== ProfileTypeEnum.Free

  const { data: approvalCount = 0 } = usePendingApprovalsCount()
  const workflowNavItems = canUseTeamFeatures
    ? getWorkflowNavItems(approvalCount)
    : getWorkflowNavItems(approvalCount).filter(item => item.title !== "Governance")

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (isMobile) {
      setSidebarModeState('expanded')
    } else {
      const stored = localStorage.getItem('sidebarMode') as 'expanded' | 'collapsed' | 'hover' | null
      if (stored) setSidebarModeState(stored)
    }

    const onModeChange = (e: CustomEvent<'expanded' | 'collapsed' | 'hover'>) => {
      const mode = e.detail
      if (window.matchMedia('(max-width: 1023px)').matches) {
        setSidebarModeState('expanded')
        return
      }
      setSidebarModeState(mode)
      localStorage.setItem('sidebarMode', mode)
    }

    window.addEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
    return () => window.removeEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
  }, [])

  const toggleSidebarMode = () => {
    const nextMode = sidebarModeState === 'expanded' ? 'collapsed' : 'expanded'
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarMode', nextMode)
      setSidebarModeState(nextMode)
      window.dispatchEvent(new CustomEvent('sidebar-mode-change', { detail: nextMode }))
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col h-full bg-transparent font-fira-sans">
        <div className="flex-1 overflow-y-auto px-3 py-8 space-y-8 scrollbar-none">
          {/* Platform Section */}
          <div className="space-y-3">
            <h3 className={cn(
              "px-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 transition-all duration-300 select-none",
              sidebarModeState === 'collapsed' && "opacity-0 translate-x-[-10px]"
            )}>
              Core Systems
            </h3>
            <nav className="space-y-1.5">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <Tooltip key={item.title}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        asChild
                        className={cn(
                          "w-full h-12 px-3 rounded-2xl transition-all duration-300 relative group overflow-hidden",
                          sidebarModeState === 'expanded' ? "justify-start" : "justify-center",
                          sidebarModeState === 'hover' && "lg:group-hover:justify-start",
                          isActive ? "bg-primary/10 text-primary shadow-inner" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        )}
                      >
                        <Link href={item.url}>
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]" />
                          )}
                          <div className={cn("relative z-10 flex items-center justify-center size-6", isActive && "text-primary")}>
                            <item.icon className={cn("size-5 transition-transform duration-300 group-hover:scale-110", sidebarModeState === 'expanded' && "mr-4", sidebarModeState === 'hover' && "lg:group-hover:mr-4")} />
                          </div>

                          <span className={cn(
                            "relative z-10 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                            sidebarModeState === 'expanded' ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 w-0",
                            sidebarModeState === 'hover' && "lg:group-hover:opacity-100 lg:group-hover:translate-x-3 lg:group-hover:w-auto"
                          )}>
                            {item.title}
                          </span>
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    {sidebarModeState !== 'expanded' && (
                      <TooltipContent side="right" className="font-bold text-[10px] uppercase tracking-widest bg-background/90 backdrop-blur-xl border border-white/10">{item.title}</TooltipContent>
                    )}
                  </Tooltip>
                )
              })}
            </nav>
          </div>

          {/* Management Section */}
          <div className="space-y-3">
            <div className={cn("h-px bg-gradient-to-r from-transparent via-border/40 to-transparent mx-4 my-2", sidebarModeState === 'collapsed' && "hidden")} />
            <h3 className={cn(
              "px-4 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 transition-all duration-300 select-none",
              sidebarModeState === 'collapsed' && "opacity-0 translate-x-[-10px]"
            )}>
              Admin Protocol
            </h3>
            <nav className="space-y-1.5">
              {workflowNavItems
                .filter(item => item.title !== "Operatives" || hasFeatureAccess('teams'))
                .map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <Tooltip key={item.title}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          asChild
                          className={cn(
                            "w-full h-12 px-3 rounded-2xl transition-all duration-300 relative group overflow-hidden",
                            sidebarModeState === 'expanded' ? "justify-start" : "justify-center",
                            sidebarModeState === 'hover' && "lg:group-hover:justify-start",
                            isActive ? "bg-primary/10 text-primary shadow-inner" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          )}
                        >
                          <Link href={item.url}>
                            {isActive && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_2px_rgba(var(--primary),0.5)]" />
                            )}
                            <div className={cn("relative z-10 flex items-center justify-center size-6", isActive && "text-primary")}>
                              <item.icon className={cn("size-5 transition-transform duration-300 group-hover:scale-110", sidebarModeState === 'expanded' && "mr-4", sidebarModeState === 'hover' && "lg:group-hover:mr-4")} />
                            </div>
                            <span className={cn(
                              "relative z-10 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                              sidebarModeState === 'expanded' ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 w-0",
                              sidebarModeState === 'hover' && "lg:group-hover:opacity-100 lg:group-hover:translate-x-3 lg:group-hover:w-auto"
                            )}>
                              {item.title}
                            </span>
                            {item.badge && (
                              <div className={cn(
                                "absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-primary text-[9px] font-black text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20",
                                sidebarModeState === 'collapsed' && "right-1 top-1 size-2 pt-0 text-transparent overflow-hidden"
                              )}>
                                {item.badge}
                              </div>
                            )}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      {sidebarModeState !== 'expanded' && (
                        <TooltipContent side="right" className="font-bold text-[10px] uppercase tracking-widest bg-background/90 backdrop-blur-xl border border-white/10">{item.title}</TooltipContent>
                      )}
                    </Tooltip>
                  )
                })}
            </nav>
          </div>
        </div>

        {/* Footer Toggle */}
        <div className="p-4 border-t border-white/5 flex justify-center bg-black/5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebarMode}
            className="rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <PanelLeftDashed className="size-5 transition-transform duration-300 group-hover:scale-110" />
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}