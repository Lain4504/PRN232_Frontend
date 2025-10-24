'use client';

import { useParams } from 'next/navigation';
import { FeatureGateWrapper } from '@/components/subscription/feature-gate-wrapper'
import { TeamManagement } from '@/components/teams/team-management'

function TeamContent() {
  const params = useParams<{ teamId?: string }>();
  const teamId = params.teamId || 'team-1'; // Default fallback
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
        <TeamManagement teamId={teamId} canManage={true} />
      </div>
    </div>
  )
}

export default function TeamPage() {
  return (
    <FeatureGateWrapper
      featureId="team_management"
      upgradePromptTitle="Team Management"
      upgradePromptDescription="Invite team members, manage permissions, and collaborate effectively."
      upgradePromptVariant="card"
    >
      <TeamContent />
    </FeatureGateWrapper>
  )
}
