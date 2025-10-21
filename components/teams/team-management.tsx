'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, 
  UserPlus, 
  Activity,
  Shield,
  Mail,
  MoreHorizontal,
  Building2,
  Plus
} from 'lucide-react';
import { TeamMembersTable } from '@/components/pages/teams/TeamMembersTable';
import { AddMemberDialog } from '@/components/pages/teams/AddMemberDialog';
import { AddBrandDialog } from '@/components/pages/teams/AddBrandDialog';
import { TeamBrandsList } from '@/components/pages/teams/TeamBrandsList';
import { EditMemberDialog } from './edit-member-dialog';
// import { TeamInvitationSystem } from './team-invitation-system';
// import { TeamActivityLog } from './team-activity-log';
// import { TeamBillingManagement } from './team-billing-management';
// import { TeamSettings } from './team-settings';
// import { TeamAnalytics } from './team-analytics';
// import { TeamAccessControl } from './team-access-control';
// import { TeamSecurityAudit } from './team-security-audit';
import { useTeam, useTeamMembers } from '@/hooks/use-teams';
import { TeamMemberResponseDto } from '@/lib/types/aisam-types';
import { formatTeamSize, formatDate } from '@/lib/utils/teams';

interface TeamManagementProps {
  teamId: string;
  canManage?: boolean;
}

export function TeamManagement({ teamId, canManage = true }: TeamManagementProps) {
  const [activeTab, setActiveTab] = useState('members');
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addBrandOpen, setAddBrandOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberResponseDto | null>(null);

  const { data: team, isLoading: teamLoading } = useTeam(teamId);
  const { data: members, isLoading: membersLoading } = useTeamMembers(teamId);

  const handleEditMember = (member: TeamMemberResponseDto) => {
    setEditingMember(member);
  };

  const handleCloseEditMember = () => {
    setEditingMember(null);
  };

  if (teamLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Team not found</h3>
        <p className="text-muted-foreground">The team you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
      </div>
    );
  }

  // Use membersCount from team data for consistency with teams list page
  const totalMembers = team.membersCount || 0;
  const activeMembers = members?.filter(m => m.isActive).length || 0;
  const pendingInvitations = 0; // TODO: Implement invitation count

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          <p className="text-muted-foreground mt-2">
            {team.description || 'Manage your team members and settings'}
          </p>
        </div>
        {canManage && (
          <div className="flex items-center gap-2">
            <Button onClick={() => setAddMemberOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Team Stats */}
      {/*<div className="grid grid-cols-1 md:grid-cols-4 gap-6">*/}
      {/*  <Card>*/}
      {/*    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">*/}
      {/*      <CardTitle className="text-sm font-medium">Total Members</CardTitle>*/}
      {/*      <Users className="h-4 w-4 text-muted-foreground" />*/}
      {/*    </CardHeader>*/}
      {/*    <CardContent>*/}
      {/*      <div className="text-2xl font-bold">{totalMembers}</div>*/}
      {/*      <p className="text-xs text-muted-foreground">*/}
      {/*        {formatTeamSize(totalMembers)}*/}
      {/*      </p>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}

      {/*  <Card>*/}
      {/*    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">*/}
      {/*      <CardTitle className="text-sm font-medium">Active Members</CardTitle>*/}
      {/*      <Shield className="h-4 w-4 text-muted-foreground" />*/}
      {/*    </CardHeader>*/}
      {/*    <CardContent>*/}
      {/*      <div className="text-2xl font-bold">{activeMembers}</div>*/}
      {/*      <p className="text-xs text-muted-foreground">*/}
      {/*        {totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0}% of total*/}
      {/*      </p>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}

      {/*  <Card>*/}
      {/*    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">*/}
      {/*      <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>*/}
      {/*      <Mail className="h-4 w-4 text-muted-foreground" />*/}
      {/*    </CardHeader>*/}
      {/*    <CardContent>*/}
      {/*      <div className="text-2xl font-bold">{pendingInvitations}</div>*/}
      {/*      <p className="text-xs text-muted-foreground">*/}
      {/*        Awaiting response*/}
      {/*      </p>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}

      {/*  <Card>*/}
      {/*    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">*/}
      {/*      <CardTitle className="text-sm font-medium">Team Status</CardTitle>*/}
      {/*      <Activity className="h-4 w-4 text-muted-foreground" />*/}
      {/*    </CardHeader>*/}
      {/*    <CardContent>*/}
      {/*      <div className="text-2xl font-bold">*/}
      {/*        <Badge variant={team.status === 'Active' ? 'default' : 'secondary'}>*/}
      {/*          {team.status}*/}
      {/*        </Badge>*/}
      {/*      </div>*/}
      {/*      <p className="text-xs text-muted-foreground">*/}
      {/*        Created {formatDate(team.createdAt)}*/}
      {/*      </p>*/}
      {/*    </CardContent>*/}
      {/*  </Card>*/}
      {/*</div>*/}

      {/* Team Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-max min-w-full">
            <TabsTrigger value="members" className="whitespace-nowrap">Members</TabsTrigger>
            <TabsTrigger value="brands" className="whitespace-nowrap">Brands</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your team members and their permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMembersTable
                teamId={teamId}
                canManage={canManage}
                onEditMember={handleEditMember}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands" className="space-y-6">
          <TeamBrandsList 
            teamId={teamId} 
            canManage={canManage} 
            onAddBrand={() => setAddBrandOpen(true)} 
          />
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        teamId={teamId}
      />

      {/* Edit Member Dialog */}
      <EditMemberDialog
        open={!!editingMember}
        onOpenChange={(open) => !open && handleCloseEditMember()}
        teamId={teamId}
        member={editingMember}
      />

      {/* Add Brand Dialog */}
      <AddBrandDialog
        open={addBrandOpen}
        onOpenChange={setAddBrandOpen}
        teamId={teamId}
        onSuccess={() => {
          // Refresh data after adding brand
          // You can add refresh logic here when backend is ready
        }}
      />
    </div>
  );
}
