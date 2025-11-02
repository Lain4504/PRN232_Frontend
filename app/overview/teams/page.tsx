"use client"

import { useState } from 'react'
import Image from 'next/image'
import { useUser } from '@/hooks/use-user'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Building2, ArrowLeft, Search, Filter } from 'lucide-react'
import Link from 'next/link'

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'bg-purple-100 text-purple-800'
      case 'Admin':
        return 'bg-blue-100 text-blue-800'
      case 'Member':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (userLoading || teamsLoading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
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
    <div className="flex-1 space-y-6 p-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center">
            <Link href="/overview">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Teams</h1>
            <p className="text-muted-foreground">
              List of teams you are participating in
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Teams Table */}
        <div className="space-y-6">
          {teamsLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-muted"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted rounded"></div>
                        <div className="h-3 w-24 bg-muted rounded"></div>
                      </div>
                      <div className="h-6 w-16 bg-muted rounded"></div>
                      <div className="h-6 w-20 bg-muted rounded"></div>
                      <div className="h-4 w-24 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : teamsError ? (
            <Card className="border-destructive">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-16 w-16 text-destructive mb-4" />
                <h3 className="text-xl font-semibold mb-2">Error loading teams list</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  There was an error loading your teams list. Please try again.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : filteredTeams.length === 0 && (searchQuery || statusFilter !== 'all') ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-20 w-20 text-muted-foreground mb-6" />
                <h3 className="text-2xl font-semibold mb-3">No teams found</h3>
                <p className="text-muted-foreground text-center mb-8 max-w-md">
                  No teams match your search criteria. Please try different filters.
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                  }} 
                  variant="outline"
                >
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : filteredTeams.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-20 w-20 text-muted-foreground mb-6" />
                <h3 className="text-2xl font-semibold mb-3">No teams yet</h3>
                <p className="text-muted-foreground text-center mb-8 max-w-md">
                  You haven&apos;t been added to any teams yet. Please contact an administrator to be invited to a team.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                <TableHead>TEAM</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>ROLE</TableHead>
                <TableHead>MEMBERS</TableHead>
                <TableHead>JOINED</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeams.map((team) => (
                    <TableRow 
                      key={team.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleTeamSelect(team)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {team.avatarUrl ? (
                              <Image 
                                src={team.avatarUrl} 
                                alt={team.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <Building2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold">{team.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="default" 
                          className={
                            (team.status === 'Active' || !team.status) 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : team.status === 'Inactive'
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-gray-500 hover:bg-gray-600'
                          }
                        >
                          {team.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getRoleColor(team.userRole)}>
                          {team.userRole}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {team.membersCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(team.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
