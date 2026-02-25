"use client"

import { AuthUser } from "@/lib/types/auth"
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
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu"
import { LogoutButton } from "@/components/auth/logout-button"
import React from "react"
import { Sparkles, Settings, LifeBuoy, Moon, Sun, Laptop, LayoutDashboard, User, LogOut } from "lucide-react"
import Link from "next/link"

type ThemeOption = "light" | "dark" | "system"

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => void
}

interface UserDropdownProps {
  user?: AuthUser | null
}

export function UserDropdown({ user }: UserDropdownProps) {
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
          <Avatar className="h-full w-full">
            <AvatarImage
              src={user?.avatarUrl}
              alt={user?.fullName}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-sm font-bold">
              {user?.fullName
                ? user.fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)
                : user?.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-lg border bg-popover p-1 shadow-md" align="end" forceMount>
        <DropdownMenuLabel className="p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold text-foreground leading-none">
              {user?.fullName || "Người dùng"}
            </p>
            <p className="text-xs font-medium text-muted-foreground truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border/50" />

        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem asChild>
            <Link href="/overview" className="flex items-center w-full px-3 py-2 rounded-md text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer outline-none">
              <LayoutDashboard className="mr-3 size-4 opacity-70" />
              Bảng điều khiển
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/overview/account" className="flex items-center w-full px-3 py-2 rounded-md text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer outline-none">
              <User className="mr-3 size-4 opacity-70" />
              Trang cá nhân
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/overview/account" className="flex items-center w-full px-3 py-2 rounded-md text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer outline-none">
              <Settings className="mr-3 size-4 opacity-70" />
              Cài đặt
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest px-3 my-2">
          Giao diện
        </DropdownMenuLabel>
        <div className="flex items-center gap-1 p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleThemeChange(e, "light")}
            className={`flex-1 rounded-lg h-9 ${theme === "light" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}
          >
            <Sun className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleThemeChange(e, "dark")}
            className={`flex-1 rounded-lg h-9 ${theme === "dark" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}
          >
            <Moon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleThemeChange(e, "system")}
            className={`flex-1 rounded-lg h-9 ${theme === "system" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}
          >
            <Laptop className="size-4" />
          </Button>
        </div>

        <DropdownMenuSeparator />

        <div className="p-1 mt-1">
          <LogoutButton className="w-full flex items-center justify-start px-3 py-2 rounded-md text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
