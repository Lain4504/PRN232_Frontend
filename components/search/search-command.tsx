"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/ui/command-palette"

export function SearchCommand() {
  return (
    <CommandPalette>
      <Button
        variant="ghost"
        className="relative h-10 w-full items-center justify-start rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 shadow-none px-4 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all sm:pr-12 md:w-48 lg:w-72"
      >
        <Search className="mr-3 h-4 w-4 opacity-50" />
        <span className="hidden lg:inline-flex">Tìm kiếm hệ thống...</span>
        <span className="inline-flex lg:hidden">Tìm kiếm...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden h-7 select-none items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 font-mono text-[10px] font-black text-slate-400 dark:text-slate-500 opacity-100 sm:flex shadow-sm">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </Button>
    </CommandPalette>
  )
}
