"use client"

import { useParams, useRouter } from 'next/navigation'
import { useDeleteTeam, useRestoreTeam, useTeam } from '@/hooks/use-teams'
import { MembersCount } from '@/components/pages/teams/MembersCount'
import { createClient } from '@/lib/supabase/client'
import { TeamEditDialog } from '@/components/pages/teams/TeamEditDialog'
import { getCurrentPermissions } from '@/lib/permissions'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Users, Pencil, Eye, Trash2, RefreshCw, Building2, ArrowLeft, Calendar, User, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TeamDetailPage() {
  const params = useParams<{ teamId: string }>()
  const teamId = params.teamId
  const { data, isLoading, isError } = useTeam(teamId)
  const { mutateAsync: deleteTeam, isPending: deleting } = useDeleteTeam(teamId)
  const { mutateAsync: restoreTeam, isPending: restoring } = useRestoreTeam(teamId)
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [can, setCan] = useState({ canManageTeams: true, canAssignBrands: true })
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [openEdit, setOpenEdit] = useState(false)

  // fetch permissions and userId client-side
  useEffect(() => {
    const fetchUserData = async () => {
      const permissions = await getCurrentPermissions()
      setCan({
        canManageTeams: permissions.canManageTeams,
        canAssignBrands: permissions.canAssignBrands
      })

      const supabase = createClient()
      const { data: sessionData } = await supabase.auth.getSession()
      setCurrentUserId(sessionData.session?.user?.id ?? null)
    }

    fetchUserData()
  }, [])

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Đang tải...</div>
  if (isError || !data) return <div className="p-4 text-sm text-destructive">Không tìm thấy team.</div>

  const isDeleted = data.status === 'Archived'
  const isOwner = !!(currentUserId && data.vendorId && currentUserId === data.vendorId)
  const canEditOrDelete = isOwner || can.canManageTeams

  async function handleDelete() {
    try {
      await deleteTeam()
      router.push(`/dashboard/teams?vendorId=${data?.vendorId ?? ''}`)
    } catch (error) {
      console.error('Failed to delete team:', error)
      alert('Không thể xoá team')
    }
  }

  async function handleRestore() {
    try {
      await restoreTeam()
    } catch (error) {
      console.error('Failed to restore team:', error)
      alert('Không thể khôi phục team')
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button variant="ghost" size="sm" className="h-8 text-xs w-full sm:w-auto" onClick={() => router.back()}>
              <ArrowLeft className="mr-1 h-3 w-3" />
              Back
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold">{data.name}</h1>
              <Badge variant={isDeleted ? 'secondary' : 'outline'} className="text-xs w-fit">
                {data.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Vendor: {data.vendorEmail || data.vendorId}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs flex-1 sm:flex-none" onClick={() => router.push(`/dashboard/teams/${teamId}/members`)}>
            <Users className="mr-1 h-3 w-3" />
            View Members
          </Button>
          {!isDeleted && canEditOrDelete && (
            <>
              <Button variant="outline" size="sm" className="h-8 text-xs flex-1 sm:flex-none" onClick={() => setOpenEdit(true)}>
                <Pencil className="mr-1 h-3 w-3" />
                Edit
              </Button>
              {(isOwner || can.canAssignBrands) && (
                <Button variant="outline" size="sm" className="h-8 text-xs flex-1 sm:flex-none" onClick={() => router.push(`/dashboard/teams/${teamId}/brands`)}>
                  <Eye className="mr-1 h-3 w-3" />
                  Assign Brands
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-8 text-xs text-destructive flex-1 sm:flex-none" onClick={() => setConfirmOpen(true)} disabled={deleting}>
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </Button>
            </>
          )}
          {isDeleted && canEditOrDelete && (
            <Button variant="outline" size="sm" className="h-8 text-xs flex-1 sm:flex-none" onClick={handleRestore} disabled={restoring}>
              {restoring ? <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
              Khôi phục
            </Button>
          )}
        </div>
      </div>

      {/* Team Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Team Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Description</div>
              <div className="text-sm text-muted-foreground">{data.description || 'No description provided'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Status</div>
              <Badge variant={isDeleted ? 'secondary' : 'outline'} className="text-xs">
                {data.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Team Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <div className="text-sm font-medium">Members</div>
                <div className="text-sm text-muted-foreground"><MembersCount teamId={teamId} /> active members</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <div className="text-sm font-medium">Created</div>
                <div className="text-sm text-muted-foreground">{new Date(data.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Owner Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-1">
                <div className="text-sm font-medium">Owner</div>
                <div className="text-sm text-muted-foreground">{data.vendorEmail || data.vendorId}</div>
              </div>
            </div>
            {data.vendorEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <div className="text-sm font-medium">Email</div>
                  <div className="text-sm text-muted-foreground">{data.vendorEmail}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {openEdit && (
        <TeamEditDialog
          open={openEdit}
          onOpenChange={setOpenEdit}
          teamId={teamId}
          initialName={data.name}
          initialDescription={data.description}
          vendorId={data.vendorId}
        />
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Xoá team
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xoá team này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Đang xoá...' : 'Xoá'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}