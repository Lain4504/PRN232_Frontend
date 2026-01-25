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
      <div className="space-y-8 p-6 lg:p-10 bg-background min-h-screen">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Link href="/overview" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              My Teams
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Access and manage your team collaborations.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Total Teams</p>
              <p className="text-2xl font-bold">{teams.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-2xl font-bold text-primary">Active</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-sm">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-background rounded-lg border-border/60"
            />
          </div>
          <div className="w-full md:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] h-10 rounded-lg">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Teams Grid */}
        <div className="space-y-6">
          {teamsError ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center border rounded-xl bg-destructive/5 border-destructive/10">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-destructive">Connection Error</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Unable to load your teams. Please check your connection.
                </p>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-8 rounded-lg h-10 px-6">
                Try Again
              </Button>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed rounded-xl bg-muted/5">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No teams found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchQuery || statusFilter !== 'all' ? 'No teams match your filters.' : 'You are not a member of any teams.'}
                </p>
              </div>
              {(searchQuery || statusFilter !== 'all') && (
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                  }}
                  variant="ghost"
                  className="mt-8 h-10 px-6 rounded-lg text-primary"
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
                  className="group rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden bg-card"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border shrink-0">
                        {team.avatarUrl ? (
                          <Image
                            src={team.avatarUrl}
                            alt={team.name}
                            width={48}
                            height={48}
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-muted-foreground/60" />
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className={`rounded-md text-[10px] font-semibold uppercase tracking-wider ${(team.status === 'Active' || !team.status)
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                          }`}
                      >
                        {team.status || 'Active'}
                      </Badge>
                    </div>

                    <div className="space-y-1 mb-6">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`rounded-sm text-[10px] font-semibold ${getRoleStyle(team.userRole)}`}>
                          {team.userRole}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Since {new Date(team.createdAt).getFullYear()}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">{team.membersCount} Members</span>
                      </div>
                      <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowLeft className="h-4 w-4 rotate-180" />
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
