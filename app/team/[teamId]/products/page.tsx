"use client"

import React, { use } from 'react'
import { useTeamBrands } from '@/hooks/use-team-brands'
import { ProductsManagement } from '@/components/pages/products/products-management'
import { TeamPermissionGate } from '@/components/teams/team-permission-gate'

export default function TeamProductsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const resolvedParams = use(params)
  const teamId = resolvedParams.teamId
  const { data: teamBrands = [] } = useTeamBrands(teamId)
  const initialBrandId = teamBrands[0]?.id

  return (
    <TeamPermissionGate permission="VIEW_POSTS">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
          <ProductsManagement initialBrandId={initialBrandId} teamId={teamId} />
        </div>
      </div>
    </TeamPermissionGate>
  )
}
