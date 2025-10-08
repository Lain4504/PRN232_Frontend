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
} from "@/components/ui/dropdown-menu"
import { LogoutButton } from "@/components/auth/logout-button"
import React from "react"

type ThemeOption = "light" | "dark" | "system"

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => void
}

interface UserDropdownProps {
  user?: User | null
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
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Account preferences</DropdownMenuItem>
        <DropdownMenuItem>Feature previews</DropdownMenuItem>
        <DropdownMenuItem>Center Help</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={(e) => handleThemeChange(e, "dark")}
          className="flex items-center gap-2"
        >
          <span
            className={
              "h-2 w-2 rounded-full inline-block " +
              (theme === "dark"
                ? "bg-foreground"
                : "bg-transparent border border-muted-foreground")
            }
          ></span>
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => handleThemeChange(e, "light")}
          className="flex items-center gap-2"
        >
          <span
            className={
              "h-2 w-2 rounded-full inline-block " +
              (theme === "light"
                ? "bg-foreground"
                : "bg-transparent border border-muted-foreground")
            }
          ></span>
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => handleThemeChange(e, "system")}
          className="flex items-center gap-2"
        >
          <span
            className={
              "h-2 w-2 rounded-full inline-block " +
              (theme === "system"
                ? "bg-foreground"
                : "bg-transparent border border-muted-foreground")
            }
          ></span>
          <span>System</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


