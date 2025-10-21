"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/ui/command-palette"

export function MobileSearchCommand() {
  return (
    <CommandPalette>
      <Button variant="ghost" size="icon" className="h-9 w-9 items-center justify-center">
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </CommandPalette>
  )
}
