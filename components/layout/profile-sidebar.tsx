"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  User,
  Users,
  Settings,
  Bell,
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

// Profile navigation items
interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const profileNavItems: NavItem[] = [
  {
    title: "Profile",
    url: "/overview",
    icon: User,
  },
  {
    title: "My Teams",
    url: "/overview/teams",
    icon: Users,
  }
]

// System and Support Navigation
const secondaryNavItems: NavItem[] = []

export function ProfileSidebar() {
  const pathname = usePathname()
  const [sidebarModeState, setSidebarModeState] = React.useState<'expanded' | 'collapsed' | 'hover'>('hover')

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (isMobile) {
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
        setSidebarModeState('expanded')
        return
      }
      if (mode === 'expanded' || mode === 'collapsed' || mode === 'hover') {
        setSidebarModeState(mode)
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
      setSidebarModeState(mode)
      window.dispatchEvent(new CustomEvent('sidebar-mode-change', { detail: mode }))
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Navigation Content */}
        <div
          className="flex-1 overflow-y-auto sidebar-scroll"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="p-2 lg:p-2">
            {/* Profile Navigation */}
            <div className="mb-6">
              <h3 className={cn(
                "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300",
                sidebarModeState === 'collapsed' && "hidden"
              )}>
                Profile
              </h3>
              {/* Profile Navigation Items */}
              <div className="space-y-2">
                {profileNavItems.map((item) => (
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
                          pathname === item.url
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
                          {/* Badge Logic Reuse - Simplified for cleaner code in replacement */}
                          {item.badge && (
                            <span className="ml-auto bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className={cn("lg:block hidden bg-popover/80 backdrop-blur-xl border-border/40 font-black uppercase text-[10px] tracking-widest", sidebarModeState === 'expanded' && "hidden")}>
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
              <div className="space-y-2">
                {secondaryNavItems.map((item) => (
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
                          pathname === item.url
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
                          {/* Badge Logic Reuse - Simplified for cleaner code in replacement */}
                          {item.badge && (
                            <span className="ml-auto bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className={cn("lg:block hidden bg-popover/80 backdrop-blur-xl border-border/40 font-black uppercase text-[10px] tracking-widest", sidebarModeState === 'expanded' && "hidden")}>
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
