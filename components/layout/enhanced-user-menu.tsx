"use client"

import type { UserResponseDto } from "@/lib/types/user"
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
  Crown,
  ChevronRight
} from "lucide-react"

type ThemeOption = "light" | "dark" | "system"

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => void
}

interface EnhancedUserMenuProps {
  user?: UserResponseDto | null
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


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.socialAccounts?.[0]?.avatarUrl}
              alt={user?.email}
            />
            <AvatarFallback className="text-xs">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        {/* User Info Header */}
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={user?.socialAccounts?.[0]?.avatarUrl}
                alt={user?.email}
              />
              <AvatarFallback>
                {user?.email?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none truncate">
                  {user?.email}
                </p>
              </div>
              <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>
        
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
