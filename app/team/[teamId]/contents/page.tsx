"use client"

import React from 'react'
import { ContentsManagement } from '@/components/pages/contents/contents-management'
import { useParams } from 'next/navigation'
import { useTeamBrands } from '@/hooks/use-team-brands'

export default function TeamContentsPage() {
  const params = useParams()
  const teamId = params.teamId as string
  const { data: teamBrands = [] } = useTeamBrands(teamId)
  const initialBrandId = teamBrands[0]?.id

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        <ContentsManagement initialBrandId={initialBrandId} teamId={teamId} />
      </div>
    </div>
  )
}

