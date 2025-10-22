"use client"

import { useEffect, useMemo, useState } from 'react'
import {
  useDeleteTeamMember,
  useTeamMembers,
  useTeam
} from '@/hooks/use-teams'
import { TeamMemberResponseDto } from '@/lib/types/aisam-types'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Trash2, User2, Edit } from 'lucide-react'
import { getPermissionInfo } from '@/lib/constants/team-roles'

interface Props {
  teamId: string
  canManage?: boolean
  paged?: boolean
  onEditMember?: (member: TeamMemberResponseDto) => void
}

export function TeamMembersTable({ teamId, canManage = true, onEditMember }: Props) {
  const listQuery = useTeamMembers(teamId)
  const teamQuery = useTeam(teamId)

  const isLoading = listQuery.isLoading
  const isError = listQuery.isError
  const data = listQuery.data
  const [, setAllowed] = useState(canManage)

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        // Check if team has no members (team creator case)
        if (!data || data.length === 0) {
          setAllowed(true)
          return
        }

        // Check if user is in team members and has ADD_MEMBER permission
        const currentUserMember = data?.find(member =>
          member.userEmail === session?.user?.email
        )

        if (currentUserMember) {
          // If user has ADD_MEMBER permission, allow
          if (currentUserMember.permissions?.includes('ADD_MEMBER')) {
            setAllowed(true)
            return
          }
        }

        setAllowed(false)
      } catch {
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
              <TableHead className="py-2 px-2 lg:px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</TableHead>
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
                <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">Loading...</TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={7} className="py-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <div className="text-sm text-destructive">Unable to load list.</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <User2 className="h-6 w-6" />
                    <div className="text-sm">No members found.</div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && rows.map((m) => (
              <MemberRow
                key={m.id}
                teamId={teamId}
                memberId={m.id}
                email={m.email}
                role={m.role}
                permissions={m.permissions}
                status={m.status}
                canManage={canManage}
                joinedAt={m.joinedAt}
                onEditMember={onEditMember}
                member={data?.find(d => d.id === m.id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function MemberRow({ teamId, memberId, email, role, permissions, status, joinedAt, canManage, onEditMember, member }: {
  teamId: string;
  memberId: string;
  email: string;
  role: string;
  permissions: string[];
  status: string;
  joinedAt?: string;
  canManage?: boolean;
  onEditMember?: (member: TeamMemberResponseDto) => void;
  member?: TeamMemberResponseDto;
}) {
  const { mutateAsync: deleteMember, isPending: deleting } = useDeleteTeamMember(teamId, memberId)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [permissionsDialog, setPermissionsDialog] = useState<{ open: boolean; permissions: string[] }>({ open: false, permissions: [] })

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell className="py-3 px-2 lg:px-3 font-mono text-xs truncate">{email}</TableCell>
        <TableCell className="py-3 px-2 lg:px-3">
          <Badge variant="outline" className="text-xs">{role || '-'}</Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell py-3 px-2 lg:px-3">
          <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted" onClick={() => setPermissionsDialog({ open: true, permissions })}>
            {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
          </Badge>
        </TableCell>
        <TableCell className="hidden lg:table-cell py-3 px-2 lg:px-3">
          <Badge variant={status === 'active' ? 'default' : 'secondary'} className="text-xs">
            {status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </TableCell>
        <TableCell className="hidden md:table-cell py-3 px-2 lg:px-3 font-mono text-sm">
          {joinedAt ? new Date(joinedAt).toLocaleDateString() : '-'}
        </TableCell>
        <TableCell className="py-3 px-2 lg:px-3 text-right">
          {canManage ? (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => member && onEditMember?.(member)}
              >
                <Edit className="mr-1 h-3 w-3" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          ) : null}
        </TableCell>
      </TableRow>


      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Member
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to remove this member from the team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await deleteMember()
                  toast.success('Delete member successful!', {
                    description: 'The member has been removed from the team.',
                    duration: 3000,
                  })
                } catch {
                  toast.error('Delete failed', {
                    description: 'Unable to delete this member.',
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

      <AlertDialog open={permissionsDialog.open} onOpenChange={(open) => setPermissionsDialog({ open, permissions: [] })}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Permissions</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              List of permissions for this member:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-60 overflow-y-auto">
            <TooltipProvider>
              <div className="space-y-2">
                {permissionsDialog.permissions.map((permission, index) => {
                  const info = getPermissionInfo(permission)
                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div className="text-sm p-2 bg-muted rounded cursor-pointer">
                          {info?.label || permission}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{info?.description || permission}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </TooltipProvider>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}