"use client"

import { useMemo, useState, Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTeamsByVendor } from '@/hooks/use-teams'
import { MembersCount } from '@/components/pages/teams/MembersCount'
import { TeamCreateDialog } from '@/components/pages/teams/TeamCreateDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Eye } from 'lucide-react'
import { api, endpoints } from '@/lib/api'
import type { TeamResponse } from '@/lib/types/aisam-types'
import type { UserResponseDto } from '@/lib/types/user'

function TeamsPageContent() {
  const router = useRouter()
  const [vendorId, setVendorId] = useState('')
  const [loading, setLoading] = useState(true)
  const { data, isLoading, isError } = useTeamsByVendor(vendorId || undefined)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get<UserResponseDto>(endpoints.userProfile)
        if (response.data.role === 'Vendor') {
          setVendorId(response.data.id)
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])
  const [openCreate, setOpenCreate] = useState(false)

  // Helper function để xác định status của team
  const getTeamStatus = (team: TeamResponse) => {
    // Use the status directly from the team object as it's already provided by the API
    return team.status;
  };

  const rows = useMemo(() => data || [], [data])

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Teams</h1>
        <Button size="sm" className="h-8 text-xs w-full sm:w-auto" disabled={!vendorId} onClick={() => setOpenCreate(true)}>
          Create Team
        </Button>
      </div>

      {loading && (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground bg-background/50">Loading vendor information...</div>
      )}

      {!loading && !vendorId && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm">
          <div>Unable to load vendor information. Please try logging in again.</div>
        </div>
      )}

      {!loading && vendorId && (
        <div className="overflow-x-auto border rounded-lg">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-auto">Name</TableHead>
                <TableHead className="hidden sm:table-cell py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-auto">Status</TableHead>
                <TableHead className="py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-auto">Members</TableHead>
                <TableHead className="hidden md:table-cell py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-auto">Created</TableHead>
                <TableHead className="text-right py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">Loading...</TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={5} className="py-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <div className="text-sm text-destructive">Không thể tải danh sách teams.</div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">Chưa có team nào. Hãy tạo team.</TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && rows.map((t) => {
                const teamStatus = getTeamStatus(t);
                return (
                <TableRow key={t.id} className="hover:bg-muted/50">
                  <TableCell className="py-3 px-3 font-medium truncate">{t.name}</TableCell>
                  <TableCell className="hidden sm:table-cell py-3 px-3">
                    <Badge variant={
                      teamStatus === 'Active' ? 'default' : 
                      teamStatus === 'Inactive' ? 'secondary' : 
                      teamStatus === 'Archived' ? 'destructive' : 
                      'outline'
                    } className="text-xs">
                      {teamStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 px-3">
                    <Badge variant="outline" className="text-xs"><MembersCount teamId={t.id} /> Members</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-3 px-3 font-mono text-sm">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-3 px-3 text-right w-16">
                    <div className="flex items-center justify-end">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => router.push(`/dashboard/teams/${t.id}`)}>
                          <Eye className="mr-1 h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <TeamCreateDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        vendorId={vendorId || ''}
        onCreated={(teamId) => router.push(`/dashboard/teams/${teamId}`)}
      />
    </div>
  )
}

export default function TeamsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeamsPageContent />
    </Suspense>
  )
}