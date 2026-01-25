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
  Moon,
  Sun,
  Monitor,
  Shield,
  Crown,
  ChevronRight,
  History
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
        <Button variant="ghost" className="relative h-9 w-9 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-white/5">
          <Avatar className="h-9 w-9 rounded-lg">
            <AvatarImage
              src={user?.socialAccounts?.[0]?.avatarUrl}
              alt={user?.fullName || user?.email}
              className="rounded-lg"
            />
            <AvatarFallback className="text-xs font-bold rounded-lg bg-primary/10 text-primary">
              {(user?.fullName || user?.email)?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 rounded-xl bg-background/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl font-fira-sans" align="end" forceMount>
        {/* User Info Header */}
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/30 border border-white/5">
            <Avatar className="h-10 w-10 rounded-lg border border-white/10 shadow-inner">
              <AvatarImage
                src={user?.socialAccounts?.[0]?.avatarUrl}
                alt={user?.fullName || user?.email}
                className="rounded-lg"
              />
              <AvatarFallback className="rounded-lg font-bold bg-muted text-muted-foreground">
                {(user?.fullName || user?.email)?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black tracking-tight leading-none truncate text-foreground">
                  {user?.fullName || "omniadly Operative"}
                </p>
              </div>
              <p className="text-[10px] font-medium leading-none text-muted-foreground mt-1.5 truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {user?.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/5" />

        {/* Account & Billing */}
        <DropdownMenuGroup className="p-1">
          <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 py-1.5">Operative Controls</DropdownMenuLabel>
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors mb-1">
            <Link href="/overview/account" className="flex items-center gap-3 p-2 font-bold text-xs uppercase tracking-wide">
              <div className="size-6 rounded-md bg-muted/50 flex items-center justify-center border border-white/5">
                <Shield className="size-3" />
              </div>
              <span>Account Control</span>
              <ChevronRight className="size-3 ml-auto opacity-50" />
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors">
            <Link href="/overview/payment" className="flex items-center gap-3 p-2 font-bold text-xs uppercase tracking-wide">
              <div className="size-6 rounded-md bg-muted/50 flex items-center justify-center border border-white/5">
                <History className="size-3" />
              </div>
              <span>Protocol History</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/5" />

        {/* Theme Settings */}
        <DropdownMenuGroup className="p-1">
          <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-2 py-1.5">
            Visual Interface
          </DropdownMenuLabel>
          <div className="grid grid-cols-3 gap-1 px-1">
            <DropdownMenuItem
              onClick={(e) => handleThemeChange(e, "light")}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border transition-all ${theme === 'light' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted/20 border-transparent hover:bg-muted/40'}`}
            >
              <Sun className="size-4" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => handleThemeChange(e, "dark")}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border transition-all ${theme === 'dark' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted/20 border-transparent hover:bg-muted/40'}`}
            >
              <Moon className="size-4" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => handleThemeChange(e, "system")}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border transition-all ${theme === 'system' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted/20 border-transparent hover:bg-muted/40'}`}
            >
              <Monitor className="size-4" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Auto</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/5" />

        {/* Logout */}
        <div className="p-1">
          <DropdownMenuItem asChild className="rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
            <LogoutButton />
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
