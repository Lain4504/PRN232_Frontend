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
import { Sparkles, Settings, LifeBuoy, Monitor, Moon, Sun, Laptop } from "lucide-react"

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
        <Button variant="ghost" className="relative h-10 w-10 rounded-xl overflow-hidden shadow-sm border border-border/50 hover:border-primary/50 transition-colors bg-background/50">
          <Avatar className="h-full w-full">
            <AvatarImage
              src={user?.avatarUrl}
              alt={user?.fullName}
              className="object-cover"
            />
            <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">
              {user?.fullName
                ? user.fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)
                : user?.email?.[0]?.toUpperCase() || "ID"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 rounded-[24px] border border-white/10 bg-background/90 backdrop-blur-2xl p-2 font-fira-sans shadow-2xl" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-black leading-none text-foreground tracking-tight">
              {user?.fullName || "Anonymous User"}
            </p>
            <p className="text-[10px] font-medium leading-none text-muted-foreground uppercase tracking-wider">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem className="rounded-xl font-bold text-[11px] uppercase tracking-wide focus:bg-muted/50 cursor-pointer py-2.5">
            <Settings className="mr-3 size-4 opacity-70" />
            Preferences
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl font-bold text-[11px] uppercase tracking-wide focus:bg-muted/50 cursor-pointer py-2.5">
            <Sparkles className="mr-3 size-4 text-amber-500 opacity-80" />
            Feature Previews
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl font-bold text[11px] uppercase tracking-wide focus:bg-muted/50 cursor-pointer py-2.5">
            <LifeBuoy className="mr-3 size-4 opacity-70" />
            Help Nexus
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/5" />

        <DropdownMenuLabel className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-[0.2em] px-3 my-1">
          Interface Mode
        </DropdownMenuLabel>
        <DropdownMenuGroup className="flex items-center gap-1 p-1">
          <DropdownMenuItem
            onClick={(e) => handleThemeChange(e, "light")}
            className="flex-1 rounded-xl justify-center font-bold text-[10px] uppercase tracking-wide cursor-pointer py-2.5 data-[state=on]:bg-muted/50"
          >
            <Sun className={theme === "light" ? "size-4 text-primary" : "size-4 opacity-50"} />
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => handleThemeChange(e, "dark")}
            className="flex-1 rounded-xl justify-center font-bold text-[10px] uppercase tracking-wide cursor-pointer py-2.5"
          >
            <Moon className={theme === "dark" ? "size-4 text-primary" : "size-4 opacity-50"} />
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => handleThemeChange(e, "system")}
            className="flex-1 rounded-xl justify-center font-bold text-[10px] uppercase tracking-wide cursor-pointer py-2.5"
          >
            <Laptop className={theme === "system" ? "size-4 text-primary" : "size-4 opacity-50"} />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuItem asChild className="rounded-xl focus:bg-destructive/10 focus:text-destructive cursor-pointer py-2.5 mt-1">
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
