"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { TeamMembersTable } from '@/components/pages/teams/TeamMembersTable'
import { AddMemberDialog } from '@/components/pages/teams/AddMemberDialog'

export default function TeamMembersPage() {
  const params = useParams<{ teamId: string }>()
  const [showAddMember, setShowAddMember] = useState(false)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Members</h1>
        <button
          onClick={() => setShowAddMember(true)}
          className="rounded bg-black text-white px-4 py-2 hover:bg-gray-800"
        >
          Thêm thành viên
        </button>
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