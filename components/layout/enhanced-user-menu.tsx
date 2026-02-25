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
  Moon,
  Sun,
  Monitor,
  Shield,
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
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.socialAccounts?.[0]?.avatarUrl || ''} alt={user?.fullName || ''} />
            <AvatarFallback>
              {(user?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName || user?.email}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/overview/account" className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Hồ sơ cá nhân</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/overview/security" className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              <span>Bảo mật</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Giao diện
        </DropdownMenuLabel>
        <div className="flex p-2 gap-1">
          {[
            { id: 'light', icon: Sun, label: 'Sáng' },
            { id: 'dark', icon: Moon, label: 'Tối' },
            { id: 'system', icon: Monitor, label: 'Hệ thống' }
          ].map((t) => (
            <Button
              key={t.id}
              variant="ghost"
              size="sm"
              onClick={(e) => handleThemeChange(e, t.id as ThemeOption)}
              className={cn(
                "flex-1 h-8 px-0",
                theme === t.id && "bg-accent text-accent-foreground"
              )}
            >
              <t.icon className="h-4 w-4" />
              <span className="sr-only">{t.label}</span>
            </Button>
          ))}
        </div>
        <DropdownMenuSeparator />
        <LogoutButton className="w-full justify-start text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10" />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
