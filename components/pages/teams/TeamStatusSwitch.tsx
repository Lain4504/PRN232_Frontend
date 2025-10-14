"use client"

import { useEffect, useState } from 'react'
import { useTeam, useUpdateTeamStatus } from '@/hooks/use-teams'
import { getCurrentPermissions } from '@/lib/permissions'

export function TeamStatusSwitch({ teamId }: { teamId: string }) {
  const { data } = useTeam(teamId)
  const { mutateAsync, isPending } = useUpdateTeamStatus(teamId)
  const [allowed, setAllowed] = useState(true)
  useEffect(() => { getCurrentPermissions().then((p) => setAllowed(p.canChangeStatus)) }, [])
  const active = data?.status === 'Active'
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm">Trạng thái</label>
      <button
        className={`rounded px-3 py-2 border ${active ? 'bg-green-600 text-white' : ''}`}
        disabled={isPending || !allowed}
        onClick={async () => {
          try {
            await mutateAsync({ status: active ? 'Inactive' : 'Active' })
          } catch {
            alert('Cập nhật trạng thái thất bại')
          }
        }}
      >
        {active ? 'Active' : 'Inactive'}
      </button>
    </div>
  )
}