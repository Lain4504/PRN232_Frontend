"use client"

import { useParams, useRouter } from 'next/navigation'
import { useDeleteTeam, useRestoreTeam, useTeam } from '@/hooks/use-teams'
import { MembersCount } from '@/components/pages/teams/MembersCount'
import { createClient } from '@/lib/supabase/client'
import { TeamEditDialog } from '@/components/pages/teams/TeamEditDialog'
import { getCurrentPermissions } from '@/lib/permissions'
import { useState, useEffect } from 'react'

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

  if (isLoading) return <div className="p-4">Đang tải...</div>
  if (isError || !data) return <div className="p-4">Không tìm thấy team.</div>

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
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{data.name}</h1>
          <div className="text-sm text-gray-600">Vendor: {data.vendorEmail || data.vendorId}</div>
        </div>
        <div className="flex gap-2">
          <button className="rounded border px-3 py-2" onClick={() => router.push(`/dashboard/teams/${teamId}/members`)}>VIEW MEMBERS</button>
          {!isDeleted && canEditOrDelete && (
            <>
              <button className="rounded border px-3 py-2" onClick={() => setOpenEdit(true)}>EDIT</button>
              {(isOwner || can.canAssignBrands) && (
                <button
                  className="rounded border px-3 py-2"
                  onClick={() => router.push(`/dashboard/teams/${teamId}/brands`)}
                >
                  ASSIGN BRANDS
                </button>
              )}
              <button className="rounded border px-3 py-2 text-red-600" onClick={() => setConfirmOpen(true)} disabled={deleting}>DELETE</button>
            </>
          )}
          {isDeleted && canEditOrDelete && (
            <button className="rounded border px-3 py-2" onClick={handleRestore} disabled={restoring}>Khôi phục</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded border p-3">
          <h2 className="font-medium mb-2">Thông tin</h2>
          <div className="text-sm space-y-1">
            <div>Mô tả: {data.description || '-'}</div>
            <div>Trạng thái: {data.status}</div>
            <div>Ngày tạo: {new Date(data.createdAt).toLocaleString()}</div>
            <div>Owner: {data.vendorEmail || '-'}</div>
            <div>Số thành viên: <MembersCount teamId={teamId} /></div>
          </div>
        </div>
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

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded bg-white p-4 shadow">
            <div className="mb-3 font-medium">Bạn có chắc chắn muốn xoá team này?</div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 rounded border" onClick={() => setConfirmOpen(false)}>Huỷ</button>
              <button className="px-3 py-2 rounded bg-red-600 text-white" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Đang xoá...' : 'Xoá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}