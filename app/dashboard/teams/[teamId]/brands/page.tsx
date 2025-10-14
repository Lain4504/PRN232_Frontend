"use client"

import { useParams } from 'next/navigation'
import { AssignBrandsPanel } from '@/components/pages/teams/AssignBrandsPanel'

export default function TeamBrandsPage() {
  const params = useParams<{ teamId: string }>()
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold mb-2">Brands</h1>
      <AssignBrandsPanel teamId={params.teamId} />
    </div>
  )
}