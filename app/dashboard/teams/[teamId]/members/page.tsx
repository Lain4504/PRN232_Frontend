"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { TeamMembersTable } from '@/components/pages/teams/TeamMembersTable'
import { AddMemberDialog } from '@/components/pages/teams/AddMemberDialog'
import { Button } from '@/components/ui/button'

export default function TeamMembersPage() {
  const params = useParams<{ teamId: string }>()
  const router = useRouter()
  const [showAddMember, setShowAddMember] = useState(false)

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 text-xs w-full sm:w-auto" onClick={() => router.back()}>
            <ArrowLeft className="mr-1 h-3 w-3" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Members</h1>
        </div>
        <Button size="sm" className="h-8 text-xs w-full sm:w-auto" onClick={() => setShowAddMember(true)}>
          <UserPlus className="mr-1 h-3 w-3" />
          Thêm thành viên
        </Button>
      </div>

      <TeamMembersTable teamId={params.teamId} />

      <AddMemberDialog
        open={showAddMember}
        onOpenChange={setShowAddMember}
        teamId={params.teamId}
      />
    </div>
  )
}