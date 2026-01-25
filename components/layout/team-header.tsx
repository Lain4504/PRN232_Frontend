"use client"

import React from "react"
import { AuthUser } from "@/lib/types/auth"
import { useTeam } from "@/lib/contexts/team-context"
import { useUser } from "@/hooks/use-user"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Building2, ChevronDown } from "lucide-react"
import { SearchCommand } from "@/components/search/search-command"
import { MobileSearchCommand } from "@/components/search/mobile-search-command"
import { Button } from "@/components/ui/button"
import { EnhancedUserMenu } from "@/components/layout/enhanced-user-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
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
  user?: AuthUser | null
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
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-background/60 backdrop-blur-2xl px-4 shadow-sm font-fira-sans transition-all duration-300">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-1" />

          <div className="h-6 w-px bg-white/10 mx-2 hidden lg:block" />

          {/* Team Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-3 rounded-xl border border-white/5 bg-background/50 hover:bg-muted/50 transition-all">
                <Building2 className="h-4 w-4 mr-2 text-primary" />
                <span className="font-bold text-sm tracking-tight">{team.name}</span>
                <ChevronDown className="h-3 w-3 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 rounded-2xl bg-background/95 backdrop-blur-xl border border-white/10 p-2">
              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 py-2">Active Networks</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/5" />
              {userTeams.map((userTeam) => (
                <DropdownMenuItem
                  key={userTeam.id}
                  onClick={() => handleTeamSwitch(userTeam.id)}
                  className={`rounded-xl py-3 cursor-pointer ${userTeam.id === team.id ? "bg-primary/10" : ""}`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{userTeam.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-medium">
                        {userTeam.userRole} • {userTeam.membersCount} operatives
                      </div>
                    </div>
                    {userTeam.id === team.id && (
                      <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-widest bg-primary/20 text-primary border-none">
                        Active
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-white/5 my-2" />
              <DropdownMenuItem onClick={handleLeaveTeam} className="text-destructive font-bold text-xs uppercase tracking-wide rounded-xl py-3 cursor-pointer hover:bg-destructive/10">
                Exit Protocol
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden md:block">
            <SearchCommand />
          </div>

          <div className="md:hidden">
            <MobileSearchCommand />
          </div>

          <div className="h-6 w-px bg-white/10 mx-1 hidden lg:block" />

          <EnhancedUserMenu user={currentUser} />
        </div>
      </header>

      {/* Leave Team Confirmation Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className="rounded-2xl bg-background/95 backdrop-blur-2xl border border-white/10 p-8 font-fira-sans">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight italic">Abort Mission?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium text-muted-foreground/80">
              You are about to exit the <strong>{team.name}</strong> workspace view. Your credentials remain active for future login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogCancel className="rounded-xl font-bold border-2">Hold Position</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeaveTeam} className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 border-none shadow-lg shadow-destructive/20">
              Confirm Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
