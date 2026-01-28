"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full size-9">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Chuyển đổi giao diện</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-slate-100 dark:border-slate-800">
                <DropdownMenuItem onClick={() => setTheme("light")} className="font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Sáng
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Tối
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Hệ thống
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
