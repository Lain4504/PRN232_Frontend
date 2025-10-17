"use client"

import { useParams, useRouter } from 'next/navigation'
import { useDeleteTeam, useRestoreTeam, useTeam } from '@/hooks/use-teams'
import { MembersCount } from '@/components/pages/teams/MembersCount'
import { TeamEditDialog } from '@/components/pages/teams/TeamEditDialog'
import { AssignBrandDialog } from '@/components/pages/teams/AssignBrandDialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Users, Pencil, Trash2, RefreshCw, Building2, Calendar, User, Mail, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

export default function TeamDetailPage() {
  const params = useParams<{ teamId: string }>()
  const teamId = params.teamId
  const { data, isLoading, isError } = useTeam(teamId)
  const { mutateAsync: deleteTeam, isPending: deleting } = useDeleteTeam(teamId)
  const { mutateAsync: restoreTeam, isPending: restoring } = useRestoreTeam(teamId)
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openAssignBrand, setOpenAssignBrand] = useState(false)

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Đang tải...</div>
  if (isError || !data) return <div className="p-4 text-sm text-destructive">Không tìm thấy team.</div>

  const isDeleted = data.status === 'Archived'

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
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard/teams">Teams</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{data.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold">{data.name}</h1>
              <Badge variant={isDeleted ? 'secondary' : 'outline'} className="text-xs w-fit">
                {data.status}
              </Badge>
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
            {!isDeleted && (
              <>
                <Button variant="outline" size="sm" className="h-8 text-xs flex-1 sm:flex-none" onClick={() => setOpenEdit(true)}>
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs flex-1 sm:flex-none" onClick={() => setOpenAssignBrand(true)}>
                  <Target className="mr-1 h-3 w-3" />
                  Assign Brand
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs text-destructive flex-1 sm:flex-none" onClick={() => setConfirmOpen(true)} disabled={deleting}>
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </>
            )}
            {isDeleted && (
              <Button variant="outline" size="sm" className="h-8 text-xs flex-1 sm:flex-none" onClick={handleRestore} disabled={restoring}>
                {restoring ? <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
                Khôi phục
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Team Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Team Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Description</div>
              <div className="text-sm text-muted-foreground">{data.description || 'No description provided'}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Status</div>
              <Badge variant={isDeleted ? 'secondary' : 'outline'} className="text-xs">
                {data.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Team Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-0">
                <div className="text-sm font-medium">Members</div>
                <div className="text-sm text-muted-foreground"><MembersCount teamId={teamId} /> active members</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-0">
                <div className="text-sm font-medium">Created</div>
                <div className="text-sm text-muted-foreground">{new Date(data.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Owner Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-0">
                <div className="text-sm font-medium">Owner</div>
                <div className="text-sm text-muted-foreground">{data.vendorEmail || data.vendorId}</div>
              </div>
            </div>
            {data.vendorEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0">
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

      {openAssignBrand && (
        <AssignBrandDialog
          open={openAssignBrand}
          onOpenChange={setOpenAssignBrand}
          teamId={teamId}
          currentBrands={data.brands || []}
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