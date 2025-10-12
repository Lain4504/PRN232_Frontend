"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Inbox, Archive } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NotificationsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hidden sm:flex">
          <Bell className="h-4 w-4" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
          >
            0
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0" align="end">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Notifications</h3>
          </div>
          <Tabs defaultValue="inbox" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inbox" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Inbox
                <Badge variant="secondary" className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  0
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Archived
              </TabsTrigger>
            </TabsList>
            <TabsContent value="inbox" className="mt-6">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Inbox className="h-10 w-10 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-lg mb-3">All caught up</h4>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  You will be notified here for any notices on your projects and activities.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="archived" className="mt-6">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Archive className="h-10 w-10 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-lg mb-3">No archived notifications</h4>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  Archived notifications will appear here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
