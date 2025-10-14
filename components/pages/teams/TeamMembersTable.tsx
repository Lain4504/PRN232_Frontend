"use client"

import { useEffect, useMemo, useState } from 'react'
import {
  useDeleteTeamMember,
  useTeamMembers,
  useUpdateTeamMember,
  useTeam
} from '@/hooks/use-teams'
import { getCurrentPermissions } from '@/lib/permissions'
import { TeamMemberResponseDto } from '@/lib/types/aisam-types'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const AVAILABLE_PERMISSIONS = [
  'CREATE_CONTENT',
  'EDIT_CONTENT',
  'SUBMIT_FOR_APPROVAL',
  'VIEW_APPROVALS',
  'APPROVE_CONTENT',
  'REJECT_CONTENT',
  'SCHEDULE_POST',
  'PUBLISH_POST',
  'VIEW_POSTS',
  'DELETE_POST',
  'VIEW_REPORTS',
  'LINK_SOCIAL_ACCOUNT',
  'UNLINK_SOCIAL_ACCOUNT',
  'ASSIGN_TASK',
  'VIEW_TEAM_ANALYTICS',
] as const

interface Props {
  teamId: string
  canManage?: boolean
  paged?: boolean
}

export function TeamMembersTable({ teamId, canManage = true, paged = false }: Props) {
  const listQuery = useTeamMembers(teamId)
  const teamQuery = useTeam(teamId)

  const isLoading = listQuery.isLoading
  const isError = listQuery.isError
  const data = listQuery.data
  const [allowed, setAllowed] = useState(canManage)

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        // Check general permissions first
        const permissions = await getCurrentPermissions()

        // If user has general manage permissions, allow
        if (permissions.canManageMembers) {
          setAllowed(true)
          return
        }

        // Check if team has no members (team creator case)
        if (!data || data.length === 0) {
          setAllowed(true)
          return
        }

        // Check if user is in team members and has ADD_MEMBER permission or is Vendor
        const currentUserMember = data?.find(member =>
          member.userEmail === session?.user?.email
        )

        if (currentUserMember) {
          // If user is Vendor role or has ADD_MEMBER permission, allow
          if (currentUserMember.role === 'Vendor' ||
            currentUserMember.permissions?.includes('ADD_MEMBER')) {
            setAllowed(true)
            return
          }
        }

        setAllowed(false)
      } catch (error) {
        setAllowed(false)
      }
    }

    checkPermissions()
  }, [canManage, teamQuery.data, data])
  const rows = useMemo(() => {
    const items = (data || []) as TeamMemberResponseDto[]
    return items.map((m) => ({
      id: m.id,
      displayName: m.userEmail ? m.userEmail.split('@')[0] : `User-${m.userId.slice(0, 8)}`,
      email: m.userEmail || '(no email)',
      role: m.role || 'member',
      status: m.isActive ? 'active' : 'inactive',
      joinedAt: m.joinedAt,
      permissions: m.permissions || [],
    }))
  }, [data])

  return (
    <div className="space-y-4">
      <div className="rounded border">
        <div className="grid grid-cols-7 gap-2 border-b p-2 text-sm font-medium bg-gray-50">
          <div>User</div>
          <div>Email</div>
          <div>Vai trò</div>
          <div>Quyền hạn</div>
          <div>Trạng thái</div>
          <div>Tham gia</div>
          <div>Actions</div>
        </div>
        {isLoading && <div className="p-4 text-sm">Đang tải...</div>}
        {isError && <div className="p-4 text-sm text-red-600">Không thể tải danh sách.</div>}
        {!isLoading && !isError && rows.length === 0 && (
          <div className="p-4 text-sm">Chưa có thành viên.</div>
        )}
        {!isLoading && !isError && rows.map((m) => (
          <MemberRow
            key={m.id}
            teamId={teamId}
            memberId={m.id}
            displayName={m.displayName}
            email={m.email}
            role={m.role}
            permissions={m.permissions}
            status={m.status}
            canManage={canManage}
            joinedAt={m.joinedAt}
          />
        ))}
      </div>
    </div>
  )
}

function MemberRow({ teamId, memberId, displayName, email, role, permissions, status, joinedAt, canManage }: {
  teamId: string;
  memberId: string;
  displayName: string;
  email: string;
  role: string;
  permissions: string[];
  status: string;
  joinedAt?: string;
  canManage?: boolean;
}) {
  const { mutateAsync: updateMember, isPending: updating } = useUpdateTeamMember(teamId, memberId)
  const { mutateAsync: deleteMember, isPending: deleting } = useDeleteTeamMember(teamId, memberId)
  const [editRole, setEditRole] = useState(role)
  const [editStatus, setEditStatus] = useState(status)
  const [editPermissions, setEditPermissions] = useState(permissions)
  const [showPermissions, setShowPermissions] = useState(false)
  const hasChanges = editRole !== role || editStatus !== status || JSON.stringify(editPermissions) !== JSON.stringify(permissions)

  return (
    <div className="grid grid-cols-7 gap-2 p-2 text-sm items-center border-t">
      <div className="truncate font-medium">{displayName}</div>
      <div className="truncate">{email}</div>
      <div>
        {canManage ? (
          <select className="rounded border px-2 py-1" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
            <option value="Copywriter">Copywriter</option>
            <option value="Designer">Designer</option>
            <option value="Marketer">Marketer</option>
          </select>
        ) : (
          role || '-'
        )}
      </div>
      <div>
        {canManage ? (
          <div>
            <button
              className="text-blue-600 underline text-xs"
              onClick={() => setShowPermissions(!showPermissions)}
            >
              {permissions.length > 0 ? `${permissions.length} quyền` : 'Chưa có quyền'}
            </button>
          </div>
        ) : (
          <span className="text-xs">{permissions.length > 0 ? `${permissions.length} quyền` : 'Chưa có quyền'}</span>
        )}
      </div>
      <div>
        {canManage ? (
          <select className="rounded border px-2 py-1" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        ) : (
          status === 'active' ? 'Hoạt động' : 'Ngừng'
        )}
      </div>
      <div className="truncate">{joinedAt ? new Date(joinedAt).toLocaleString() : '-'}</div>
      <div className="flex gap-2">
        {canManage && (
          <>
            {hasChanges && (
              <button
                className="rounded border px-2 py-1"
                onClick={async () => {
                  try {
                    await updateMember({
                      role: editRole,
                      isActive: editStatus === 'active',
                      permissions: editPermissions
                    })
                    toast.success('Cập nhật thành công!', {
                      description: `${editRole === role ? 'Trạng thái' : 'Vai trò và trạng thái'} đã được cập nhật.`,
                      duration: 3000,
                    })
                  } catch (error) {
                    toast.error('Cập nhật thất bại', {
                      description: 'Không thể cập nhật thông tin thành viên.',
                      duration: 4000,
                    })
                  }
                }}
                disabled={updating}
              >
                Lưu
              </button>
            )}
            <button
              className="rounded border px-2 py-1 text-red-600"
              onClick={async () => {
                if (!confirm('Xoá thành viên này?')) return
                try {
                  await deleteMember()
                  toast.success('Xóa thành viên thành công!', {
                    description: 'Thành viên đã được xóa khỏi team.',
                    duration: 3000,
                  })
                } catch (error) {
                  toast.error('Xóa thất bại', {
                    description: 'Không thể xóa thành viên này.',
                    duration: 4000,
                  })
                }
              }}
              disabled={deleting}
            >
              Xoá
            </button>
          </>
        )}
      </div>

      {/* Permissions Panel */}
      {showPermissions && canManage && (
        <div className="col-span-7 p-4 bg-gray-50 border-t">
          <div className="mb-3">
            <h4 className="font-medium mb-2">Quản lý quyền hạn cho {displayName}</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <label key={permission} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editPermissions.includes(permission)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditPermissions([...editPermissions, permission])
                      } else {
                        setEditPermissions(editPermissions.filter(p => p !== permission))
                      }
                    }}
                  />
                  <span className="truncate" title={permission}>{permission}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}