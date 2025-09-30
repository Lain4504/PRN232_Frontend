"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Users, Building2, BarChart3, FileText, Calendar, Mail, Settings, User } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Mock search data - trong thực tế sẽ fetch từ API hoặc generate từ routes
const searchData = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Building2,
    description: "Main dashboard overview"
  },
  {
    title: "Organizations",
    url: "/dashboard/organizations", 
    icon: Building2,
    description: "Manage organizations"
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
    description: "User management"
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: BarChart3,
    description: "Analytics and reports"
  },
  {
    title: "Documents",
    url: "/dashboard/documents",
    icon: FileText,
    description: "Document management"
  },
  {
    title: "Calendar",
    url: "/dashboard/calendar",
    icon: Calendar,
    description: "Calendar and events"
  },
  {
    title: "Messages",
    url: "/dashboard/messages",
    icon: Mail,
    description: "Messages and notifications"
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    description: "Application settings"
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: User,
    description: "User profile management"
  },
]

export function MobileSearchCommand() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const handleSelect = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 items-center justify-center">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput placeholder="Search pages..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Pages">
              {searchData.map((item) => (
                <CommandItem
                  key={item.url}
                  value={item.title}
                  onSelect={() => handleSelect(item.url)}
                  className="cursor-pointer"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
