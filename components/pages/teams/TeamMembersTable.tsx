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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal, Save, Trash2, ShieldCheck, Mail, User2 } from 'lucide-react'

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
      <div className="overflow-x-auto border rounded-lg">
        <Table className="min-w-[600px] w-full">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">User</TableHead>
              <TableHead className="hidden sm:table-cell py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</TableHead>
              <TableHead className="py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</TableHead>
              <TableHead className="hidden md:table-cell py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Permissions</TableHead>
              <TableHead className="hidden lg:table-cell py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</TableHead>
              <TableHead className="hidden md:table-cell py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Joined</TableHead>
              <TableHead className="text-right py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">Đang tải...</TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={7} className="py-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <div className="text-sm text-destructive">Không thể tải danh sách.</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <User2 className="h-6 w-6" />
                    <div className="text-sm">Chưa có thành viên.</div>
                  </div>
                </TableCell>
              </TableRow>
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
          </TableBody>
        </Table>
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const hasChanges = editRole !== role || editStatus !== status || JSON.stringify(editPermissions) !== JSON.stringify(permissions)

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="py-3 px-2 lg:px-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-8 w-8 ring-1 ring-muted flex-shrink-0">
              <AvatarFallback className="text-xs font-semibold">
                {displayName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-medium truncate">{displayName}</div>
              <div className="sm:hidden flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{email}</span>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="hidden sm:table-cell py-3 px-2 lg:px-3 font-mono text-xs truncate">{email}</TableCell>
        <TableCell className="py-3 px-2 lg:px-3">
          {canManage ? (
            <Select value={editRole} onValueChange={setEditRole}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Copywriter">Copywriter</SelectItem>
                <SelectItem value="Designer">Designer</SelectItem>
                <SelectItem value="Marketer">Marketer</SelectItem>
                <SelectItem value="TeamLeader">Team Leader</SelectItem>
                <SelectItem value="Vendor">Vendor</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="outline" className="text-xs">{role || '-'}</Badge>
          )}
        </TableCell>
        <TableCell className="hidden md:table-cell py-3 px-2 lg:px-3">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setShowPermissions((v) => !v)}
            disabled={!canManage}
          >
            <ShieldCheck className="mr-2 h-3 w-3" />
            {editPermissions.length} quyền
          </Button>
        </TableCell>
        <TableCell className="hidden lg:table-cell py-3 px-2 lg:px-3">
          {canManage ? (
            <Select value={editStatus} onValueChange={setEditStatus}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant={status === 'active' ? 'default' : 'secondary'} className="text-xs">
              {status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </TableCell>
        <TableCell className="hidden md:table-cell py-3 px-2 lg:px-3 font-mono text-sm">
          {joinedAt ? new Date(joinedAt).toLocaleDateString() : '-'}
        </TableCell>
        <TableCell className="py-3 px-2 lg:px-3 text-right">
          {canManage ? (
            <div className="flex items-center justify-end gap-2">
              <div className="hidden lg:flex items-center gap-2">
                {hasChanges && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={async () => {
                      try {
                        await updateMember({
                          role: editRole,
                          isActive: editStatus === 'active',
                          permissions: editPermissions
                        })
                        toast.success('Cập nhật thành công!', {
                          description: 'Thông tin thành viên đã được cập nhật.',
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
                    <Save className="mr-2 h-3 w-3" />
                    Lưu
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  onClick={() => setConfirmOpen(true)}
                  disabled={deleting}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="lg:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {hasChanges && (
                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            await updateMember({
                              role: editRole,
                              isActive: editStatus === 'active',
                              permissions: editPermissions
                            })
                            toast.success('Cập nhật thành công!', { duration: 3000 })
                          } catch {
                            toast.error('Cập nhật thất bại')
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thay đổi
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => setConfirmOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xoá thành viên
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ) : null}
        </TableCell>
      </TableRow>

      {showPermissions && canManage && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={7} className="py-0">
            <div className="p-4 bg-muted/50 border-t">
              <div className="mb-3">
                <h4 className="font-medium mb-2">Quản lý quyền hạn cho {displayName}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <label key={permission} className="flex items-center gap-2">
                      <Checkbox
                        checked={editPermissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) setEditPermissions([...editPermissions, permission])
                          else setEditPermissions(editPermissions.filter(p => p !== permission))
                        }}
                      />
                      <span className="truncate" title={permission}>{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Xoá thành viên
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xoá thành viên này khỏi team? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
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
                } finally {
                  setConfirmOpen(false)
                }
              }}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}