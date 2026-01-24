"use client"

import { useState } from 'react'
import Image from 'next/image'
import { useUser } from '@/hooks/use-user'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Building2, ArrowLeft, Search, Filter, AlertCircle, Shield } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

interface Team {
  id: string
  name: string
  description?: string
  userRole: 'Owner' | 'Admin' | 'Member'
  membersCount: number
  createdAt: string
  avatarUrl?: string
  status?: 'Active' | 'Inactive' | 'Archived'
}

export default function TeamsPage() {
  const { data: user, isLoading: userLoading } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Load user's teams
  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useQuery({
    queryKey: ['user-teams', user?.id],
    queryFn: async (): Promise<Team[]> => {
      if (!user?.id) return []
      try {
        const response = await api.get('/team/user-teams')
        return Array.isArray(response.data) ? response.data : []
      } catch (error) {
        console.error('Error loading teams:', error)
        return []
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const handleTeamSelect = (team: Team) => {
    // Set team context and navigate to team dashboard
    localStorage.setItem('activeTeamId', team.id)
    window.location.href = `/team/${team.id}`
  }

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'bg-purple-500/10 text-purple-600 border-purple-200/50'
      case 'Admin':
        return 'bg-blue-500/10 text-blue-600 border-blue-200/50'
      case 'Member':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-200/50'
    }
  }

  if (userLoading || teamsLoading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden font-fira-sans">
        <div className="space-y-10 p-6 lg:p-10 bg-background">
          <Skeleton className="h-4 w-48 mb-6 rounded-xl" />
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Skeleton className="h-12 w-64 rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
            <Skeleton className="h-16 w-full rounded-[2rem] mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-[2rem]" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Filter teams based on search query and status
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || team.status === statusFilter || (!team.status && statusFilter === 'Active')
    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-[1440px] mx-auto font-fira-sans">
      <div className="space-y-12 p-6 lg:p-10 bg-background min-h-screen">

        {/* Tactical Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <Link href="/overview" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Collaboration</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground leading-none">
              My <span className="text-primary italic">Teams</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl tracking-tight leading-relaxed">
              Access the teams you are part of. Collaborate with members and manage your projects efficiently.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats Badge */}
            <div className="px-8 py-5 bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border/40 shadow-xl flex items-center gap-10">
              <div className="space-y-1">
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Total Teams</div>
                <div className="text-2xl font-black font-fira-mono tracking-tighter tabular-nums text-foreground">{teams.length}</div>
              </div>
              <div className="h-10 w-px bg-border/20" />
              <div className="space-y-1">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Status</div>
                <div className="text-2xl font-black font-fira-mono tracking-tighter tabular-nums text-primary uppercase leading-none italic">ACTIVE</div>
              </div>
            </div>
          </div>
        </div>

        {/* Command Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card/20 backdrop-blur-md p-4 rounded-[2rem] border border-border/40 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground stroke-[2.5]" />
            <Input
              placeholder="SEARCH YOUR TEAMS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-14 bg-background/50 border-transparent focus:bg-background focus:border-primary/20 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-none"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px] h-14 rounded-2xl border-border/40 bg-background/50 font-bold text-[10px] uppercase tracking-widest focus:ring-primary/20">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 stroke-[2.5]" />
                  <SelectValue placeholder="FILTER STATUS" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl font-bold uppercase tracking-wider text-xs">
                <SelectItem value="all">ALL TEAMS</SelectItem>
                <SelectItem value="Active">ACTIVE</SelectItem>
                <SelectItem value="Inactive">INACTIVE</SelectItem>
                <SelectItem value="Archived">ARCHIVED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="space-y-6">
          {teamsError ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 bg-destructive/5 rounded-[3rem] border border-destructive/20 p-10">
              <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-destructive stroke-[2]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-destructive">Connection Error</h3>
                <p className="text-muted-foreground font-medium max-w-md mx-auto">
                  Unable to load your teams. Please check your internet connection and try again.
                </p>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline" className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest border-destructive/30 hover:bg-destructive/10 text-destructive">
                Try Again
              </Button>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8 bg-card/20 backdrop-blur-sm rounded-[3rem] border-4 border-dashed border-border/40 p-10 group">
              <div className="h-32 w-32 rounded-[2.5rem] bg-muted/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Shield className="h-16 w-16 text-muted-foreground/40 stroke-[1.5]" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black uppercase tracking-tight">No Teams Found</h3>
                <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                  {searchQuery || statusFilter !== 'all' ? 'No teams match your search filters.' : 'You are not a member of any teams yet.'}
                </p>
              </div>
              {(searchQuery || statusFilter !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                  }}
                  variant="ghost"
                  className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest hover:bg-primary/10 text-primary"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <Card
                  key={team.id}
                  onClick={() => handleTeamSelect(team)}
                  className="group relative bg-card/40 backdrop-blur-xl border-border/40 hover:border-primary/50 rounded-[2.5rem] transition-all duration-300 shadow-xl shadow-black/5 overflow-hidden cursor-pointer hover:-translate-y-1"
                >
                  {/* Hover Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <CardContent className="p-8 space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="relative h-20 w-20 rounded-[1.5rem] bg-muted/20 flex items-center justify-center overflow-hidden border border-border/50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                        {team.avatarUrl ? (
                          <Image
                            src={team.avatarUrl}
                            alt={team.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-muted-foreground/50 stroke-[2]" />
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${(team.status === 'Active' || !team.status)
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          }`}
                      >
                        {team.status || 'Active'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-black uppercase tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`px-2.5 py-1 rounded-md border text-[9px] font-bold uppercase tracking-wider ${getRoleStyle(team.userRole)}`}>
                          {team.userRole}
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Since {new Date(team.createdAt).getFullYear()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/30 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                        <Users className="h-4 w-4 stroke-[2.5]" />
                        <span className="font-fira-mono font-bold text-sm tracking-tight">{team.membersCount} Members</span>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <ArrowLeft className="h-4 w-4 rotate-180 stroke-[3]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
