'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomTabs, CustomTabItem } from '@/components/ui/custom-tabs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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
  const [activeTab, setActiveTab] = useState('overview');
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

  // Tab configuration
  const tabItems: CustomTabItem[] = [
    {
      value: 'overview',
      label: 'Overview',
    },
    {
      value: 'members',
      label: 'Members',
    },
    {
      value: 'brands',
      label: 'Brands',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/teams">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teams
          </Button>
        </Link>
      </div>

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
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Enhanced Team Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:scale-105 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalMembers}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:scale-105 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-chart-2/20 to-chart-2/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeMembers}</p>
                <p className="text-sm text-muted-foreground">Active Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:scale-105 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-chart-3/20 to-chart-3/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Mail className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingInvitations}</p>
                <p className="text-sm text-muted-foreground">Pending Invites</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:scale-105 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-chart-4/20 to-chart-4/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <Badge variant={team.status === 'Active' ? 'default' : 'secondary'} className="text-xs font-medium">
                  {team.status}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Team Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Management Tabs */}
      <div className="space-y-6">
        <CustomTabs
          items={tabItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Enhanced Quick Actions */}
            <Card className="border border-primary/20 group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-chart-3/20 to-chart-3/10 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-chart-3" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  Common management actions for this team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group/action"
                    onClick={() => setAddMemberOpen(true)}
                    disabled={!canManage}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center group-hover/action:scale-110 transition-transform duration-200">
                      <UserPlus className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Invite Member</span>
                    <span className="text-xs text-muted-foreground text-center">Add new team member</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group/action"
                    onClick={() => setAddBrandOpen(true)}
                    disabled={!canManage}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center group-hover/action:scale-110 transition-transform duration-200">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Add Brand</span>
                    <span className="text-xs text-muted-foreground text-center">Assign brand to team</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group/action"
                    onClick={() => setActiveTab('members')}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center group-hover/action:scale-110 transition-transform duration-200">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Manage Members</span>
                    <span className="text-xs text-muted-foreground text-center">View all team members</span>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group/action"
                    onClick={() => setActiveTab('brands')}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center group-hover/action:scale-110 transition-transform duration-200">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Manage Brands</span>
                    <span className="text-xs text-muted-foreground text-center">View team brands</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Team Information Card */}
            <Card className="border border-blue-200 dark:border-blue-800">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-xs mb-1">
                      Team Management Dashboard
                    </h3>
                    <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                      Manage your team members, assign brands, and monitor team activity. 
                      Use the quick actions above to perform common management tasks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Team Members</h2>
              <p className="text-muted-foreground text-sm">
                Manage your team members and their permissions
              </p>
            </div>
            <TeamMembersTable
              teamId={teamId}
              canManage={canManage}
              onEditMember={handleEditMember}
              onInviteMember={() => setAddMemberOpen(true)}
            />
          </div>
        )}

        {activeTab === 'brands' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Team Brands</h2>
              <p className="text-muted-foreground text-sm">
                Manage brands associated with this team
              </p>
            </div>
            <TeamBrandsList 
              teamId={teamId} 
              canManage={canManage} 
              onAddBrand={() => setAddBrandOpen(true)} 
            />
          </div>
        )}
      </div>

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
