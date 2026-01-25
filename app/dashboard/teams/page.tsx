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
import { CustomTable } from '@/components/ui/custom-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Users, Building2, Trash2, Edit, Plus, Search, Shield, AlertCircle } from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import { ColumnDef } from '@tanstack/react-table'
import type { TeamResponse } from '@/lib/types/aisam-types'
import { Input } from "@/components/ui/input"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

function TeamsPageContent() {
  const { data: user, isLoading: userLoading } = useUser()
  const { activeProfileId, profileType } = useProfile()
  const { data, isLoading, isError } = useTeamsByVendor(activeProfileId || undefined)
  const [openCreate, setOpenCreate] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
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
    return team.status;
  };

  const rows = useMemo(() => {
    if (!data) return []
    if (!searchTerm) return data

    return data.filter(team =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const columns: ColumnDef<TeamResponse>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "Team Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-4 py-2">
          <div className="relative h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Building2 className="h-5 w-5 text-primary stroke-[2.5]" />
          </div>
          <div>
            <div className="font-bold text-foreground text-sm uppercase tracking-tight">{row.getValue("name")}</div>
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">ID: {row.original.id.substring(0, 8)}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = getTeamStatus(row.original);
        return (
          <Badge variant="outline" className={`rounded-md px-2.5 py-0.5 font-bold uppercase tracking-wider text-[10px] border ${status === 'Active'
            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
            : 'bg-muted/50 text-muted-foreground border-border/50'
            }`}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "membersCount",
      header: "Members",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[...Array(Math.min(3, row.original.membersCount || 0))].map((_, i) => (
              <div key={i} className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                <UserIcon />
              </div>
            ))}
            {(row.original.membersCount || 0) > 3 && (
              <div className="h-6 w-6 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[8px] font-bold text-primary">
                +{(row.original.membersCount || 0) - 3}
              </div>
            )}
          </div>
          <span className="text-xs font-mono font-medium text-muted-foreground">
            {row.original.membersCount || 0} Total
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => (
        <div className="font-mono text-xs text-muted-foreground">
          {new Date(row.getValue("createdAt")).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "View Team",
            icon: <Eye className="h-4 w-4" />,
            onClick: () => window.open(`/dashboard/teams/${row.original.id}`, '_self'),
          },
          {
            label: "Edit Team",
            icon: <Edit className="h-4 w-4" />,
            onClick: () => setEditDialog({ open: true, team: row.original }),
          },
          {
            label: "Delete Team",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => setDeleteDialog({ open: true, teamId: row.original.id, teamName: row.original.name }),
            variant: "destructive" as const,
          },
        ];

        return (
          <div className="flex justify-end">
            <ActionsDropdown actions={actions} />
          </div>
        );
      },
    },
  ], []);

  const TeamsTableSkeleton = () => (
    <div className="rounded-3xl bg-card/60 border border-border/40 overflow-hidden">
      <Skeleton className="h-16 w-full rounded-none opacity-20" />
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl opacity-10" />)}
      </div>
    </div>
  )

  const UserIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 lg:py-14 bg-background font-fira-sans min-h-screen">
      <div className="space-y-12">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList className="gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 hover:text-primary transition-colors">Workspace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/30 scale-75" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/80">Teams Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Collaboration</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
              Team <span className="text-primary">Management</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
              Create and manage teams, assign members, and oversee project collaboration.
            </p>
          </div>

          {!userLoading && !isLoading && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="group relative flex flex-col min-w-[140px] p-1">
                <span className="text-4xl font-black text-foreground font-fira-mono tracking-tighter tabular-nums group-hover:text-primary transition-colors">{rows.length}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 px-0.5">Active Teams</span>
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-primary/20 group-hover:w-full transition-all duration-500" />
              </div>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="sticky top-20 z-40 flex flex-col md:flex-row items-center justify-between gap-6 p-5 bg-background/60 backdrop-blur-xl border border-border/40 rounded-2xl shadow-xl shadow-foreground/[0.02]">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="SEARCH TEAM NAME..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 border-none bg-muted/30 focus-visible:ring-primary/20 rounded-2xl font-medium transition-all duration-300 placeholder:text-muted-foreground/40 text-[11px] font-bold uppercase tracking-wider"
            />
          </div>

          {!userLoading && !isLoading && (
            <Button
              onClick={() => setOpenCreate(true)}
              className="w-full md:w-auto rounded-[1.2rem] h-12 px-8 bg-primary hover:bg-primary/95 text-primary-foreground font-bold uppercase tracking-wider shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
              disabled={!checkFeatureAccess(profileType, 'teams')}
            >
              <Plus className="mr-2 h-4 w-4 stroke-[3]" />
              Create New Team
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="relative min-h-[400px]">
          {userLoading || isLoading ? (
            <TeamsTableSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-96 text-center bg-destructive/5 rounded-3xl border border-destructive/20 p-10">
              <AlertCircle className="h-16 w-16 text-destructive mb-6 stroke-[1.5]" />
              <h3 className="text-2xl font-black uppercase tracking-tight text-destructive mb-2">System Error</h3>
              <p className="text-muted-foreground font-medium">Failed to retrieve team data. Please try again later.</p>
            </div>
          ) : !checkFeatureAccess(profileType, 'teams') ? (
            <div className="flex flex-col items-center justify-center h-96 text-center bg-muted/10 rounded-3xl border border-border/40 p-10">
              <Shield className="h-16 w-16 text-muted-foreground mb-6 stroke-[1.5]" />
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Restricted Access</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">Advanced team management requires higher clearance level. Upgrade your subscription to access this feature.</p>
              <Button variant="outline" className="rounded-xl border-primary/20 text-primary hover:bg-primary/5">View Plans</Button>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-border/40 border-dashed rounded-3xl bg-muted/5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--color-primary)_0%,transparent_50%)] opacity-[0.02]" />

              <div className="h-24 w-24 rounded-2xl bg-card flex items-center justify-center shadow-xl border border-border/40 mb-8 group-hover:scale-110 transition-transform duration-500">
                <Plus className="h-10 w-10 text-primary/40 stroke-[1.5]" />
              </div>

              <h3 className="text-2xl font-black uppercase tracking-tight mb-3 text-foreground">
                {searchTerm ? "No Matches Found" : "No Teams Yet"}
              </h3>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto mb-8 leading-relaxed">
                {searchTerm
                  ? "Your search terms did not match any active teams."
                  : "Start by creating your first team to collaborate."}
              </p>

              {!searchTerm && (
                <Button
                  onClick={() => setOpenCreate(true)}
                  className="rounded-full px-10 h-14 bg-card hover:bg-muted text-foreground border border-border/40 font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Team
                </Button>
              )}
            </div>
          ) : (
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000" />
              <Card className="relative border-border/40 bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
                <CustomTable
                  columns={columns}
                  data={rows}
                  pageSize={10}
                  className="border-0 shadow-none bg-transparent"
                  headerClassName="bg-muted/20 hover:bg-muted/20 border-b border-border/40 py-6"
                />
              </Card>
            </div>
          )}
        </div>

        {/* Create Team Dialog */}
        <TeamCreateDialog
          open={openCreate}
          onOpenChange={setOpenCreate}
          vendorId={user?.id || ''}
          onCreated={() => {
            // In a real app we'd use react-query invalidation, but for now reload works
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
  <div className="w-full max-w-full overflow-x-hidden font-fira-sans">
    <div className="space-y-10 p-6 lg:p-10 bg-background">
      <Skeleton className="h-4 w-48 mb-6 rounded-xl" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-16 w-full rounded-2xl mb-10" />
        <div className="rounded-3xl bg-card border border-border/40 overflow-hidden h-[500px]" />
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
