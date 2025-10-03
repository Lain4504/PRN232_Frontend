"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Home,
  Settings,
  BarChart3,
  FileText,
  Calendar,
  Mail,
  User,
  Target,
  Package,
  CheckCircle,
  Share2,
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
import { Settings as CogIcon } from "lucide-react"

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
    title: "Products",
    url: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Contents",
    url: "/dashboard/contents",
    icon: FileText,
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
    title: "Approvals",
    url: "/dashboard/approvals", 
    icon: CheckCircle,
    badge: "1" as const,
  },
  {
    title: "Posts",
    url: "/dashboard/posts",
    icon: Mail,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: BarChart3,
  },
]

// Menu phụ - đơn giản hóa
const secondaryNavItems: NavItem[] = [
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
]



export function DashboardSidebar() {
  const pathname = usePathname()
  const [sidebarModeState, setSidebarModeState] = React.useState<'expanded'|'collapsed'|'hover'>('hover')

  React.useEffect(() => {
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('sidebarMode') as 'expanded' | 'collapsed' | 'hover' | null) : null
    if (stored === 'expanded' || stored === 'collapsed' || stored === 'hover') {
      setSidebarModeState(stored)
    }
    const onModeChange = (e: CustomEvent<'expanded' | 'collapsed' | 'hover'>) => {
      const mode = e.detail
      if (mode === 'expanded' || mode === 'collapsed' || mode === 'hover') setSidebarModeState(mode)
    }
    window.addEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
    return () => window.removeEventListener('sidebar-mode-change', onModeChange as unknown as EventListener)
  }, [])


  // Custom sidebar với hover expand effect

  const setSidebarMode = (mode: 'expanded' | 'collapsed' | 'hover') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarMode', mode)
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
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
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
                              <span className="absolute right-0 top-1 hidden lg:inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] leading-none text-primary-foreground">
                                {item.badge}
                              </span>
                            )}
                            {sidebarModeState === 'hover' && (
                              <>
                                <span className="absolute right-0 top-1 hidden lg:inline-flex lg:group-hover:hidden h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] leading-none text-primary-foreground">
                                  {item.badge}
                                </span>
                                <span className="ml-auto hidden lg:group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                  {item.badge}
                                </span>
                              </>
                            )}
                            {sidebarModeState === 'expanded' && (
                              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className={cn("lg:block hidden", sidebarModeState === 'expanded' && "hidden") }>
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-sidebar-border my-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300" />

            {/* System Navigation */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
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
                    <TooltipContent side="right" className={cn("lg:block hidden", sidebarModeState === 'expanded' && "hidden") }>
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with mode switcher icon */}
        <div className="p-2 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full h-10 lg:h-10 px-2 lg:justify-center">
                <CogIcon className="h-5 w-5" />
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