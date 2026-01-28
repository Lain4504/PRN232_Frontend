"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/ui/command-palette"

export function MobileSearchCommand() {
  return (
    <CommandPalette>
      <Button variant="ghost" size="icon" className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <Search className="size-4 text-slate-500 dark:text-slate-400" />
        <span className="sr-only">Tìm kiếm</span>
      </Button>
    </CommandPalette>
  )
}
