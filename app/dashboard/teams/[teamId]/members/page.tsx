"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { TeamMembersTable } from '@/components/pages/teams/TeamMembersTable'
import { AddMemberDialog } from '@/components/pages/teams/AddMemberDialog'
import { EditMemberDialog } from '@/components/pages/teams/EditMemberDialog'
import { Button } from '@/components/ui/button'
import { useTeam } from '@/hooks/use-teams'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { TeamMemberResponseDto } from '@/lib/types/aisam-types'

export default function TeamMembersPage() {
  const params = useParams<{ teamId: string }>()
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMemberResponseDto | null>(null)
  const [showEditMember, setShowEditMember] = useState(false)
  const { data: team } = useTeam(params.teamId)

  return (
    <div className="p-4 space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/teams">Teams</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/teams/${params.teamId}`}>{team?.name || 'Team'}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Members</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Members</h1>
        <Button size="sm" className="h-8 text-xs w-full sm:w-auto" onClick={() => setShowAddMember(true)}>
          <UserPlus className="mr-1 h-3 w-3" />
          Add Member
        </Button>
      </div>

      <TeamMembersTable
        teamId={params.teamId}
        onEditMember={(member) => {
          setSelectedMember(member)
          setShowEditMember(true)
        }}
      />

      <AddMemberDialog
        open={showAddMember}
        onOpenChange={setShowAddMember}
        teamId={params.teamId}
      />

      <EditMemberDialog
        open={showEditMember}
        onOpenChange={setShowEditMember}
        teamId={params.teamId}
        member={selectedMember}
      />
    </div>
  )
}