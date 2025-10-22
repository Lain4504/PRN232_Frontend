"use client"

import React, { useMemo, useState, Suspense } from 'react'
import Link from 'next/link'
import { useTeamsByVendor } from '@/hooks/use-teams'
import { useUser } from '@/hooks/use-user'
import { useProfile } from '@/lib/contexts/profile-context'
import { checkFeatureAccess, ProfileTypeEnum } from '@/lib/utils/profile-utils'
import { TeamCreateDialog } from '@/components/pages/teams/TeamCreateDialog'
import { TeamDeleteDialog } from '@/components/pages/teams/TeamDeleteDialog'
import { EditTeamDialog } from '@/components/teams/edit-team-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Users, Building2, Trash2, Edit } from 'lucide-react'
import type { TeamResponse } from '@/lib/types/aisam-types'

function TeamsPageContent() {
  const { data: user, isLoading: userLoading } = useUser()
  const { activeProfileId, profileType } = useProfile()
  const { data, isLoading, isError } = useTeamsByVendor(activeProfileId || undefined)
  const [openCreate, setOpenCreate] = useState(false)
  const [editDialog, setEditDialog] = useState<{ open: boolean; team: TeamResponse | null }>({
    open: false,
    team: null
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; teamId: string; teamName: string }>({
    open: false,
    teamId: '',
    teamName: ''
  })

  // Helper function để xác định status của team
  const getTeamStatus = (team: TeamResponse) => {
    // Use the status directly from the team object as it's already provided by the API
    return team.status;
  };

  const rows = useMemo(() => data || [], [data])

  // Skeleton component for teams table
  const TeamsTableSkeleton = () => (
    <div className="bg-card rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(3)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-12 rounded" />
                  <Skeleton className="h-8 w-12 rounded" />
                  <Skeleton className="h-8 w-12 rounded" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Teams</h1>
            <p className="text-muted-foreground">
              Manage your teams and team members
            </p>
          </div>
          {/* Only show Create Team button when user has teams */}
          {!userLoading && !isLoading && rows.length > 0 && (
            <Button onClick={() => setOpenCreate(true)}>
              Create Team
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {userLoading || isLoading ? (
        <TeamsTableSkeleton />
      ) : isError ? (
        <div className="text-center py-12">
          <div className="text-destructive">Error loading teams</div>
        </div>
      ) : !checkFeatureAccess(profileType, 'teams') ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Teams require Basic or Pro subscription. Please upgrade your profile.</div>
        </div>
      ) : rows.length === 0 ? (
        <Card className="border border-dashed border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed max-w-sm mx-auto">
              Create your first team to start collaborating with your team members and managing projects together.
            </p>
            <Button 
              onClick={() => setOpenCreate(true)} 
              size="sm" 
              className="h-8 text-xs"
            >
              <Building2 className="mr-1 h-3 w-3" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">
                    {team.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTeamStatus(team) === 'Active' ? 'default' : 'secondary'}>
                      {getTeamStatus(team)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {team.membersCount || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(team.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/teams/${team.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-blue-600 border-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-orange-600 border-orange-600 hover:bg-orange-50 hover:text-orange-700"
                        onClick={() => setEditDialog({ open: true, team })}
                        aria-label="Chỉnh sửa team"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteDialog({ open: true, teamId: team.id, teamName: team.name })}
                        aria-label="Xóa team"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Xóa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Team Dialog */}
      <TeamCreateDialog 
        open={openCreate} 
        onOpenChange={setOpenCreate}
        vendorId={user?.id || ''}
        onCreated={() => {
          // Refresh data after creating team
          window.location.reload()
        }}
      />

      {/* Edit Team Dialog */}
      {editDialog.team && (
        <EditTeamDialog
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))}
          team={editDialog.team}
        />
      )}

      {/* Delete Team Dialog */}
      <TeamDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        teamId={deleteDialog.teamId}
        teamName={deleteDialog.teamName}
      />
      </div>
    </div>
  )
}

// Loading skeleton for Suspense fallback
const PageSkeleton = () => (
  <div className="max-w-7xl mx-auto">
    <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
      {/* Header Skeleton */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      {/* Table Skeleton */}
      <div className="bg-card rounded-lg border">
        <div className="p-4 border-b">
          <div className="grid grid-cols-5 gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default function TeamsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TeamsPageContent />
    </Suspense>
  )
}
