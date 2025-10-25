"use client"

import { useEffect, useState, useMemo } from 'react'
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
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { CustomTable } from '@/components/ui/custom-table'
import { ColumnDef } from '@tanstack/react-table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Trash2, User2, Edit, Search, Users } from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  teamId: string
  canManage?: boolean
  paged?: boolean
  onEditMember?: (member: TeamMemberResponseDto) => void
  onInviteMember?: () => void
}

// Create columns for the data table
const createColumns = (
  handleEditMember: (member: TeamMemberResponseDto) => void,
  handleDeleteMember: (memberId: string) => void,
  canManage: boolean,
  isDeleting: boolean
): ColumnDef<TeamMemberResponseDto>[] => [
  {
    accessorKey: "userEmail",
    header: "Member",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            <User2 className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-gray-800">{row.original.userEmail || '(no email)'}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.userEmail ? row.original.userEmail.split('@')[0] : `User-${row.original.userId.slice(0, 8)}`}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant="outline" className="text-xs">
          {row.getValue("role") || 'member'}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions = row.getValue("permissions") as string[] || [];
      return (
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant={row.getValue("isActive") ? 'default' : 'secondary'} className="text-xs">
          {row.getValue("isActive") ? 'Active' : 'Inactive'}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "joinedAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = row.getValue("joinedAt") as string;
      return (
        <span className="text-sm text-muted-foreground text-center block">
          {date ? new Date(date).toLocaleDateString() : '-'}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    size: 50,
    maxSize: 50,
    cell: ({ row }) => {
      if (!canManage) return null;
      
      const actions: ActionItem[] = [
        {
          label: "Edit",
          icon: <Edit className="h-4 w-4" />,
          onClick: () => handleEditMember(row.original),
        },
        {
          label: "Delete",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => handleDeleteMember(row.original.id),
          variant: "destructive" as const,
          disabled: isDeleting,
        },
      ];

      return <ActionsDropdown actions={actions} disabled={isDeleting} />;
    },
  },
];

export function TeamMembersTable({ teamId, canManage = true, onEditMember, onInviteMember }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

  const listQuery = useTeamMembers(teamId)
  const teamQuery = useTeam(teamId)
  const deleteMemberMutation = useDeleteTeamMember(teamId, deleteMemberId || '');

  const isLoading = listQuery.isLoading
  const isError = listQuery.isError
  const data = listQuery.data || []
  const [, setAllowed] = useState(canManage)

  // Filter members based on search term
  const filteredMembers = useMemo(() => {
    return data.filter(member => {
      if (!searchTerm) return true;
      return member.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
             member.role?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm]);

  const [pageSize, setPageSize] = useState(10);

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

    if (data) {
      checkPermissions()
    }
  }, [canManage, teamQuery.data, data.length]) // Use data.length instead of data to prevent infinite loop



  const handleDeleteMember = (memberId: string) => {
    setDeleteMemberId(memberId);
  };

  const confirmDeleteMember = async () => {
    if (!deleteMemberId) return;
    
    const memberToDelete = data.find(m => m.id === deleteMemberId);
    const memberEmail = memberToDelete?.userEmail || 'this member';

    try {
      await deleteMemberMutation.mutateAsync();
      toast.success(`Member "${memberEmail}" has been removed from the team successfully`);
      setDeleteMemberId(null);
    } catch (error) {
      console.error('Failed to delete member:', error);
      toast.error('Failed to remove member');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="h-10 w-64 mb-3 bg-muted animate-pulse rounded" />
              <div className="h-5 w-80 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-8 w-28 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
        <Trash2 className="h-4 w-4 text-destructive" />
        <div className="text-sm text-destructive">Unable to load members list.</div>
      </div>
    );
  }

  const totalMembers = data.length;

  return (
    <>
      {/* Single Row Layout - Stats, Rows, Search */}
      <div className="flex items-center gap-4">
        {/* Stats */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-sm shadow-sm">
          <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="font-semibold text-gray-700">{totalMembers}</span>
          <span className="text-gray-500">Members</span>
        </div>

        {/* Page Size Selector */}
        <Select
          value={String(pageSize)}
          onValueChange={(value) => setPageSize(Number(value))}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Rows" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        {/* Invite Button */}
        {canManage && (
          <div className="ml-auto">
            <Button size="sm" onClick={onInviteMember}>
              <User2 className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        )}
      </div>

      {/* Members Table */}
      {filteredMembers.length > 0 ? (
        <CustomTable
          columns={createColumns(
            onEditMember || (() => {}),
            handleDeleteMember,
            canManage,
            deleteMemberMutation.isPending
          )}
          data={filteredMembers}
          pageSize={pageSize}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <User2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No members found' : 'No members yet'}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed max-w-sm mx-auto">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Invite team members to get started'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteMemberId} onOpenChange={() => setDeleteMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Remove Member?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMemberMutation.isPending}
            >
              {deleteMemberMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Member
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

