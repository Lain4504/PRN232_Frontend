"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/ui/command-palette"

export function SearchCommand() {
  return (
    <CommandPalette>
      <Button
        variant="outline"
        className="relative h-9 w-full items-center justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
    </CommandPalette>
  )
}
