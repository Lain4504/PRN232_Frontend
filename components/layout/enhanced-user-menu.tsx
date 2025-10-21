"use client"

import { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { LogoutButton } from "@/components/auth/logout-button"
import { Badge } from "@/components/ui/badge"
import React from "react"
import Link from "next/link"
import { 
  User as UserIcon, 
  Settings, 
  Bell, 
  CreditCard, 
  HelpCircle, 
  Moon, 
  Sun, 
  Monitor,
  Shield,
  Zap,
  Crown,
  ChevronRight
} from "lucide-react"

type ThemeOption = "light" | "dark" | "system"

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => void
}

interface EnhancedUserMenuProps {
  user?: User | null
}

export function EnhancedUserMenu({ user }: EnhancedUserMenuProps) {
  const { setTheme, theme } = useTheme()

  const handleThemeChange = (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>,
    nextTheme: ThemeOption,
  ) => {
    const root = document.documentElement
    const vtDoc = document as ViewTransitionDoc
    if (!vtDoc.startViewTransition) {
      setTheme(nextTheme)
      return
    }
    root.style.setProperty("--x", `${e.clientX}px`)
    root.style.setProperty("--y", `${e.clientY}px`)
    vtDoc.startViewTransition(() => setTheme(nextTheme))
  }

  const userRole = user?.user_metadata?.role || "User"
  const isPremium = user?.user_metadata?.subscription === "premium"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.user_metadata?.avatar_url}
              alt={user?.user_metadata?.full_name}
            />
            <AvatarFallback className="text-xs">
              {user?.user_metadata?.full_name
                ? user.user_metadata.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                : user?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {isPremium && (
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        {/* User Info Header */}
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={user?.user_metadata?.avatar_url}
                alt={user?.user_metadata?.full_name}
              />
              <AvatarFallback>
                {user?.user_metadata?.full_name
                  ? user.user_metadata.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                  : user?.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none truncate">
                  {user?.user_metadata?.full_name || "User"}
                </p>
                {isPremium && (
                  <Badge variant="secondary" className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
              <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                {user?.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground mt-1">
                {userRole} • {isPremium ? "Premium Plan" : "Free Plan"}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        {/* Quick Actions */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile" className="flex items-center gap-3 p-2">
              <UserIcon className="h-4 w-4" />
              <span>Profile</span>
              <ChevronRight className="h-3 w-3 ml-auto" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/notifications" className="flex items-center gap-3 p-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
              <Badge variant="secondary" className="ml-auto text-xs">5</Badge>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings" className="flex items-center gap-3 p-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
              <ChevronRight className="h-3 w-3 ml-auto" />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Account & Billing */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account/me" className="flex items-center gap-3 p-2">
              <Shield className="h-4 w-4" />
              <span>Account</span>
              <ChevronRight className="h-3 w-3 ml-auto" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/billing" className="flex items-center gap-3 p-2">
              <CreditCard className="h-4 w-4" />
              <span>Billing & Plans</span>
              {!isPremium && (
                <Badge variant="outline" className="ml-auto text-xs bg-primary/10 text-primary border-primary/20">
                  Upgrade
                </Badge>
              )}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Theme Settings */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">
            Appearance
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={(e) => handleThemeChange(e, "light")}
            className="flex items-center gap-3 p-2"
          >
            <Sun className="h-4 w-4" />
            <span>Light</span>
            <span
              className={
                "h-2 w-2 rounded-full ml-auto " +
                (theme === "light"
                  ? "bg-foreground"
                  : "bg-transparent border border-muted-foreground")
              }
            />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => handleThemeChange(e, "dark")}
            className="flex items-center gap-3 p-2"
          >
            <Moon className="h-4 w-4" />
            <span>Dark</span>
            <span
              className={
                "h-2 w-2 rounded-full ml-auto " +
                (theme === "dark"
                  ? "bg-foreground"
                  : "bg-transparent border border-muted-foreground")
              }
            />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => handleThemeChange(e, "system")}
            className="flex items-center gap-3 p-2"
          >
            <Monitor className="h-4 w-4" />
            <span>System</span>
            <span
              className={
                "h-2 w-2 rounded-full ml-auto " +
                (theme === "system"
                  ? "bg-foreground"
                  : "bg-transparent border border-muted-foreground")
              }
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Support & Help */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/help" className="flex items-center gap-3 p-2">
              <HelpCircle className="h-4 w-4" />
              <span>Help & Support</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem asChild>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
