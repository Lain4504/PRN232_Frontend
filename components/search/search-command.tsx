"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/ui/command-palette"

export function SearchCommand() {
  return (
    <CommandPalette>
      <Button
        variant="outline"
        className="relative h-10 w-full items-center justify-start rounded-md bg-muted/50 border-border text-xs font-medium text-muted-foreground shadow-sm px-4 hover:bg-muted transition-all sm:pr-12 md:w-48 lg:w-72"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Tìm kiếm hệ thống...</span>
        <span className="inline-flex lg:hidden">Tìm kiếm...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden h-6 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </Button>
    </CommandPalette>
  )
}
