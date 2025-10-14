"use client"

import { useMemo } from 'react'
import { useTeamMembers } from '@/hooks/use-teams'

export function MembersCount({ teamId }: { teamId: string }) {
  const { data, isLoading, isError } = useTeamMembers(teamId)
  const count = useMemo(() => (data ? data.length : 0), [data])

  if (isLoading) return <>-</>
  if (isError) return <>-</>
  return <>{count}</>
}