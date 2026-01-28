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
        <Button variant="ghost" className="relative h-10 w-10 p-0 rounded-full overflow-hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Avatar className="h-full w-full">
            <AvatarImage
              src={user?.socialAccounts?.[0]?.avatarUrl}
              alt={user?.fullName || user?.email}
              className="object-cover"
            />
            <AvatarFallback className="bg-slate-900 dark:bg-primary text-white w-full h-full flex items-center justify-center text-sm font-bold">
              {(user?.fullName || user?.email)?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 overflow-hidden" align="end" forceMount>
        <DropdownMenuLabel className="p-5">
          <div className="flex flex-col space-y-1.5">
            <p className="text-sm font-black text-slate-900 dark:text-white leading-none uppercase tracking-tight">
              {user?.fullName || "Người dùng"}
            </p>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 truncate uppercase tracking-widest">{user?.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800/50 mx-2" />

        <DropdownMenuGroup className="p-1 space-y-0.5">
          <DropdownMenuItem asChild>
            <Link href="/overview" className="flex items-center w-full px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer outline-none group">
              <UserIcon className="mr-3 size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              Tài khoản của tôi
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/overview/payment" className="flex items-center w-full px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer outline-none group">
              <History className="mr-3 size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              Lịch sử thanh toán
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/overview/account" className="flex items-center w-full px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer outline-none group">
              <Settings className="mr-3 size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              Cài đặt hệ thống
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800/50 mx-2" />

        <DropdownMenuLabel className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-[0.2em] px-4 py-4">
          GIAO DIỆN HỆ THỐNG
        </DropdownMenuLabel>
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mx-1 mb-1 border border-slate-100 dark:border-slate-800">
          {[
            { id: "light", icon: Sun },
            { id: "dark", icon: Moon },
            { id: "system", icon: Monitor }
          ].map((opt) => (
            <Button
              key={opt.id}
              variant="ghost"
              size="sm"
              onClick={(e) => handleThemeChange(e, opt.id as ThemeOption)}
              className={cn(
                "flex-1 rounded-xl h-10 transition-all duration-300",
                theme === opt.id
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-800"
                  : "text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800"
              )}
            >
              <opt.icon className="size-4" />
            </Button>
          ))}
        </div>

        <DropdownMenuSeparator className="bg-slate-50 dark:bg-slate-800/50 mx-2" />

        <div className="p-1 mt-1">
          <LogoutButton className="w-full flex items-center justify-start px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer border-none shadow-none" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
