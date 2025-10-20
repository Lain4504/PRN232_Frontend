'use client';

import { TeamActivityFeed } from './team-activity-feed';
import { TeamActivityLog } from '@/lib/types/teams';

interface TeamActivityLogProps {
  teamId: string;
  canView?: boolean;
}

// Mock data - replace with actual API calls
const mockActivities: TeamActivityLog[] = [
  {
    id: '1',
    teamId: 'team-1',
    userEmail: 'admin@example.com',
    type: 'member_joined',
    details: { email: 'john.doe@example.com', role: 'Copywriter' },
    timestamp: '2024-12-19T10:30:00Z'
  },
  {
    id: '2',
    teamId: 'team-1',
    userEmail: 'admin@example.com',
    type: 'member_role_changed',
    details: { email: 'jane.smith@example.com', oldRole: 'Member', newRole: 'Team Leader' },
    timestamp: '2024-12-19T09:15:00Z'
  },
  {
    id: '3',
    teamId: 'team-1',
    userEmail: 'admin@example.com',
    type: 'content_created',
    details: { email: 'mike.johnson@example.com', role: 'Designer' },
    timestamp: '2024-12-18T16:45:00Z'
  },
  {
    id: '4',
    teamId: 'team-1',
    userEmail: 'admin@example.com',
    type: 'settings_updated',
    details: { setting: 'allowMemberInvites', oldValue: false, newValue: true },
    timestamp: '2024-12-18T14:20:00Z'
  },
  {
    id: '5',
    teamId: 'team-1',
    userEmail: 'admin@example.com',
    type: 'member_left',
    details: { email: 'old.member@example.com', role: 'Member' },
    timestamp: '2024-12-17T11:30:00Z'
  },
  {
    id: '6',
    teamId: 'team-1',
    userEmail: 'admin@example.com',
    type: 'billing_updated',
    details: { plan: 'Pro', oldPlan: 'Basic' },
    timestamp: '2024-12-16T13:15:00Z'
  }
];

export function TeamActivityLog({ teamId, canView = true }: TeamActivityLogProps) {
  return (
    <TeamActivityFeed 
      teamId={teamId}
      activities={mockActivities}
      canView={canView}
      onLoadMore={() => console.log('Load more activities')}
    />
  );
}
