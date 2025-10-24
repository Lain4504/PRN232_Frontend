"use client"

import React, { useState, useEffect } from "react"
import { User } from "@supabase/supabase-js"
import { useTeam } from "@/lib/contexts/team-context"
import { useUser } from "@/hooks/use-user"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Zap, Menu, Building2, ChevronDown } from "lucide-react"
import { SearchCommand } from "@/components/search/search-command"
import { MobileSearchCommand } from "@/components/search/mobile-search-command"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { EnhancedUserMenu } from "@/components/layout/enhanced-user-menu"
import { EnhancedNotifications } from "@/components/layout/enhanced-notifications"
import { TeamSidebar } from "@/components/layout/team-sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"

interface TeamHeaderProps {
  user?: User | null
  team: {
    id: string
    name: string
    role: string
    membersCount: number
  }
}

interface Team {
  id: string
  name: string
  description?: string
  userRole: string
  membersCount: number
  createdAt: string
  avatarUrl?: string
}

export function TeamHeader({ user, team }: TeamHeaderProps) {
  const { clearActiveTeam } = useTeam()
  const { data: currentUser } = useUser()
  const [showLeaveDialog, setShowLeaveDialog] = React.useState(false)

  // Fetch user's teams for team switcher
  const { data: userTeams = [] } = useQuery({
    queryKey: ['user-teams', currentUser?.id],
    queryFn: async (): Promise<Team[]> => {
      if (!currentUser?.id) return []
      try {
        const response = await api.get('/team/user-teams')
        return Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error loading teams:', error)
        return []
      }
    },
    enabled: !!currentUser?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const handleTeamSwitch = (teamId: string) => {
    // Navigate to the new team
    window.location.href = `/team/${teamId}`
  }

  const handleLeaveTeam = () => {
    setShowLeaveDialog(true)
  }

  const confirmLeaveTeam = () => {
    // Clear current team and redirect to teams overview
    clearActiveTeam()
    window.location.href = '/overview/teams'
  }

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 px-2 lg:px-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Team Navigation</SheetTitle>
              <div className="h-full">
                <TeamSidebar/>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Zap className="size-4 lg:size-5 text-primary" />
            <span className="font-semibold text-sm lg:text-base">AISAM</span>
          </div>

          {/* Team Switcher */}
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 px-2">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span className="font-medium">{team.name}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Switch Team</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userTeams.map((userTeam) => (
                  <DropdownMenuItem
                    key={userTeam.id}
                    onClick={() => handleTeamSwitch(userTeam.id)}
                    className={userTeam.id === team.id ? "bg-accent" : ""}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Building2 className="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{userTeam.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {userTeam.userRole} • {userTeam.membersCount} members
                        </div>
                      </div>
                      {userTeam.id === team.id && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLeaveTeam} className="text-destructive">
                  Leave Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3">
          <div className="hidden lg:block">
            <SearchCommand />
          </div>

          <div className="lg:hidden">
            <MobileSearchCommand />
          </div>

          <EnhancedNotifications />

          <EnhancedUserMenu user={currentUser} />
        </div>
      </header>

      {/* Leave Team Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave <strong>{team.name}</strong>? You will be redirected to the teams overview page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeaveTeam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Leave Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
