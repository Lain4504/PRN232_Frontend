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
        <Button variant="ghost" className="relative h-10 w-10 rounded-full overflow-hidden hover:bg-slate-100 transition-colors">
          <Avatar className="h-full w-full">
            <AvatarImage
              src={user?.socialAccounts?.[0]?.avatarUrl}
              alt={user?.fullName || user?.email}
              className="object-cover"
            />
            <AvatarFallback className="bg-slate-900 text-white text-[10px] font-bold">
              {(user?.fullName || user?.email)?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200" align="end" forceMount>
        <DropdownMenuLabel className="p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold text-slate-900 leading-none">
              {user?.fullName || "Người dùng"}
            </p>
            <p className="text-xs font-medium text-slate-400 truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-slate-50" />

        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem asChild>
            <Link href="/overview" className="flex items-center w-full px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer outline-none">
              <UserIcon className="mr-3 size-4 opacity-70" />
              Tài khoản của tôi
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/overview/payment" className="flex items-center w-full px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer outline-none">
              <History className="mr-3 size-4 opacity-70" />
              Lịch sử thanh toán
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/overview/account" className="flex items-center w-full px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer outline-none">
              <Settings className="mr-3 size-4 opacity-70" />
              Cài đặt
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-slate-50" />

        <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-3 my-2">
          Giao diện
        </DropdownMenuLabel>
        <div className="flex items-center gap-1 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleThemeChange(e, "light")}
            className={`flex-1 rounded-lg h-9 ${theme === "light" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
          >
            <Sun className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleThemeChange(e, "dark")}
            className={`flex-1 rounded-lg h-9 ${theme === "dark" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
          >
            <Moon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleThemeChange(e, "system")}
            className={`flex-1 rounded-lg h-9 ${theme === "system" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}
          >
            <Monitor className="size-4" />
          </Button>
        </div>

        <DropdownMenuSeparator className="bg-slate-50" />

        <div className="p-1 mt-1">
          <LogoutButton className="w-full flex items-center justify-start px-3 py-2 rounded-xl text-sm font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
