"use client"

import React from 'react'
import { SharedApprovalManagement } from '@/components/approvals/shared-approval-management'
import { useParams } from 'next/navigation'

export default function TeamApprovalPage() {
  const params = useParams()
  const teamId = params.teamId as string

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold">Team Approvals</h1>
            <p className="text-muted-foreground">
              Review and approve content for your team
            </p>
          </div>
        </div>

        {/* Approval Management */}
        <SharedApprovalManagement
          context="team"
          teamId={teamId}
          title="Team Approvals"
          description="Review and approve content for your team"
          showCreateButton={true}
        />
      </div>
    </div>
  )
}
