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
import React from "react"
import Link from "next/link"
import {
  User as UserIcon,
  Settings,
  Moon,
  Sun,
  Monitor,
  Shield,
  History,
} from "lucide-react"
import { cn } from "@/lib/utils"

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
        <Button variant="ghost" className="relative h-10 w-10 p-0 rounded-full overflow-hidden hover:bg-accent transition-colors">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user?.socialAccounts?.[0]?.avatarUrl || ''} alt={user?.fullName || ''} />
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-medium">
              {(user?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-1 rounded-lg border shadow-md" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center gap-2 p-3">
          <Avatar className="h-8 w-8 rounded">
            <AvatarImage src={user?.socialAccounts?.[0]?.avatarUrl || ''} alt={user?.fullName || ''} />
            <AvatarFallback className="rounded bg-primary text-primary-foreground text-[10px] font-bold">
              {(user?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-bold leading-none">{user?.fullName || user?.email}</span>
            <span className="text-[11px] text-muted-foreground mt-1 truncate">{user?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/overview/profile" className="cursor-pointer flex items-center gap-2">
              <UserIcon className="size-4" />
              <span>Hồ sơ cá nhân</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/overview/security" className="cursor-pointer flex items-center gap-2">
              <Shield className="size-4" />
              <span>Bảo mật</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="p-2 space-y-2">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Giao diện</div>
          <div className="flex bg-muted rounded-md p-1">
            {[
              { id: 'light', icon: Sun, label: 'Sáng' },
              { id: 'dark', icon: Moon, label: 'Tối' },
              { id: 'system', icon: Monitor, label: 'Hệ thống' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={(e) => handleThemeChange(e, t.id as ThemeOption)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-sm text-xs font-medium transition-all",
                  theme === t.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <t.icon className="size-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
        <DropdownMenuSeparator />
        <LogoutButton className="w-full flex items-center gap-2 p-2 px-3 text-destructive hover:bg-destructive/10 rounded-md transition-colors" />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
