"use client"

import React, { use, useState } from 'react'
import { useTeam } from '@/lib/contexts/team-context'
import { useTeam as useTeamQuery, useTeamMembers } from '@/hooks/use-teams'
import { useUser } from '@/hooks/use-user'
import { TeamPermissionGate } from '@/components/teams/team-permission-gate'
import { EditTeamDialog } from '@/components/teams/edit-team-dialog'
import { AddMemberDialog } from '@/components/pages/teams/AddMemberDialog'
import { AddBrandDialog } from '@/components/pages/teams/AddBrandDialog'
import { EditMemberDialog } from '@/components/teams/edit-member-dialog'
import { TeamMembersTable } from '@/components/pages/teams/TeamMembersTable'
import { TeamBrandsList } from '@/components/pages/teams/TeamBrandsList'
import { TeamMemberResponseDto } from '@/lib/types/aisam-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { CustomTabs, CustomTabItem } from '@/components/ui/custom-tabs'
import { 
  Users, 
  Shield, 
  User, 
  Calendar, 
  Activity, 
  Mail, 
  Settings, 
  Loader2, 
  UserCheck,
  UserPlus,
  Building2,
  Crown,
  Plus,
  AlertCircle,
  CheckCircle,
  Star,
  TrendingUp,
  Globe,
  Clock,
  Zap
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils/teams'

export default function TeamSettingsPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { activeTeam, currentMember, hasPermission } = useTeam()
  const resolvedParams = use(params)
  const teamId = resolvedParams.teamId
  
  // Fetch team and members data from API
  const { data: team, isLoading: teamLoading, error: teamError } = useTeamQuery(teamId)
  const { data: members, isLoading: membersLoading, error: membersError } = useTeamMembers(teamId)
  const { data: user } = useUser()
  
  // State for dialogs
  const [editTeamOpen, setEditTeamOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [addBrandOpen, setAddBrandOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMemberResponseDto | null>(null)
  const [showAllPermissions, setShowAllPermissions] = useState(false)
  
  // State for tabs
  const [activeTab, setActiveTab] = useState('members')
  
  // Define tab items based on permissions
  const getTabItems = (): CustomTabItem[] => {
    const tabs: CustomTabItem[] = []
    
    // Members tab - always visible if user can view team members
    if (hasPermission('VIEW_TEAM_MEMBERS')) {
      tabs.push({ value: 'members', label: 'Members' })
    }
    
    // Permissions tab - only visible if user can view permissions
    if (hasPermission('VIEW_TEAM_PERMISSIONS')) {
      tabs.push({ value: 'permissions', label: 'Permissions' })
    }
    
    // Brands tab - visible if user can view team members (similar permission level)
    if (hasPermission('VIEW_TEAM_MEMBERS')) {
      tabs.push({ value: 'brands', label: 'Brands' })
    }
    
    return tabs
  }
  
  const tabItems = getTabItems()
  
  // Ensure activeTab is valid based on available tabs
  const validActiveTab = tabItems.length > 0 && tabItems.some(tab => tab.value === activeTab) 
    ? activeTab 
    : tabItems.length > 0 
      ? tabItems[0].value 
      : 'members'
  
  // Update activeTab if it's not valid
  if (validActiveTab !== activeTab) {
    setActiveTab(validActiveTab)
  }
  
  // Find current user's membership
  const currentUserMember = members?.find(m => m.userId === user?.id)
  
  // Handlers for member dialogs
  const handleEditMember = (member: TeamMemberResponseDto) => {
    setEditingMember(member)
  }
  
  const handleCloseEditMember = () => {
    setEditingMember(null)
  }
  
  // Loading state
  if (teamLoading || membersLoading) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Skeleton className="h-10 w-64 mb-3" />
              <Skeleton className="h-5 w-80" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="shadow-none border border-neutral-200/60 dark:border-neutral-800/60 bg-card/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  // Error state
  if (teamError || membersError) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="shadow-none border border-neutral-200/60 dark:border-neutral-800/60">
            <CardContent className="p-6">
              <div className="text-center">
                <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">Error Loading Team</h3>
                <p className="text-muted-foreground">
                  {teamError?.message || membersError?.message || 'Failed to load team data'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // Team not found
  if (!team) {
    return (
      <div className="flex-1 space-y-8 p-6 lg:p-8 bg-background">
          <div className="flex items-center justify-center min-h-[400px]">
          <Card className="shadow-none border border-neutral-200/60 dark:border-neutral-800/60">
            <CardContent className="p-6">
              <div className="text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">Team Not Found</h3>
                <p className="text-muted-foreground">The requested team could not be found.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <TeamPermissionGate permission="VIEW_TEAM_MEMBERS">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6 lg:space-y-8 p-4 lg:p-6 xl:p-8 bg-background">
          {/* Enhanced Header */}
          <div className="space-y-3 lg:space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold tracking-tight text-foreground">
                Team Settings
              </h1>
              <p className="text-sm lg:text-base xl:text-lg text-muted-foreground mt-2 max-w-2xl">
                Manage your team members, permissions, and settings for {team?.name}
              </p>
            </div>
          </div>

          {/* Custom Tabs - only show if user has access to multiple tabs */}
          {tabItems.length > 1 ? (
            <CustomTabs
              items={tabItems}
              activeTab={validActiveTab}
              onTabChange={setActiveTab}
            />
          ) : tabItems.length === 1 ? (
            <div className="border-b border-neutral-200/60 dark:border-neutral-800/60">
              <div className="flex items-center space-x-8">
                <div className="border-b-2 border-primary pb-2">
                  <span className="text-sm font-medium text-primary">
                    {tabItems[0].label}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <Card className="border border-muted">
              <CardContent className="p-6">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">No Access</h3>
                  <p className="text-muted-foreground">
                    You don&apos;t have permission to view any team settings sections.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tab Content */}
          {tabItems.length > 0 && (
            <>
              {validActiveTab === 'members' && (
            <div className="space-y-6">
              {/* Enhanced Team Members */}
              <TeamMembersTable 
                teamId={teamId}
                canManage={hasPermission('INVITE_MEMBER')}
                onEditMember={handleEditMember}
                onInviteMember={() => setAddMemberOpen(true)}
              />
            </div>
          )}

          {validActiveTab === 'permissions' && (
            <div className="space-y-6">
              {/* Enhanced Your Role Card */}
              <Card className="shadow-none border border-neutral-200/60 dark:border-neutral-800/60">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                <CardTitle className="text-lg font-semibold">Your Role & Permissions</CardTitle>
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                Your current role and permissions in this team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground font-semibold">
                        {user?.email?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{user?.email}</p>
                      <p className="text-sm text-muted-foreground">Your account</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-md bg-muted/20">
                      <span className="text-sm text-muted-foreground">Role</span>
                      <Badge 
                        variant={currentUserMember?.role === 'Vendor' ? 'default' : 'secondary'}
                            className="capitalize font-medium"
                      >
                        {currentUserMember?.role || 'Unknown'}
                      </Badge>
                    </div>
                    
                        <div className="flex items-center justify-between p-2 rounded-md bg-muted/20">
                      <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant={currentUserMember?.isActive ? "default" : "secondary"} className="font-medium">
                        {currentUserMember?.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                        <div className="flex items-center justify-between p-2 rounded-md bg-muted/20">
                      <span className="text-sm text-muted-foreground">Joined</span>
                      <span className="text-sm font-medium text-foreground">
                        {currentUserMember?.joinedAt ? formatRelativeTime(currentUserMember.joinedAt) : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Your Permissions</h4>
                    {currentUserMember?.permissions && currentUserMember.permissions.length > 6 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllPermissions(!showAllPermissions)}
                            className="text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        {showAllPermissions ? 'Show Less' : `+${currentUserMember.permissions.length - 6} more`}
                      </Button>
                    )}
                  </div>
                      <div className="grid grid-cols-1 gap-2">
                    {(showAllPermissions 
                      ? currentUserMember?.permissions 
                      : currentUserMember?.permissions?.slice(0, 6)
                    )?.map((permission, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs p-2 rounded-md bg-muted/20 hover:bg-muted/30 transition-colors">
                            <div className="w-2 h-2 bg-chart-2 rounded-full flex-shrink-0"></div>
                        <span className="text-muted-foreground truncate">
                          {permission.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            </div>
          )}

          {validActiveTab === 'brands' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Team Brands</h2>
                <p className="text-muted-foreground text-sm">
                  Manage brands associated with this team
                </p>
              </div>
              <TeamBrandsList 
                teamId={teamId} 
                canManage={hasPermission('INVITE_MEMBER')} 
                onAddBrand={() => setAddBrandOpen(true)} 
              />
            </div>
          )}

          
            </>
          )}
          
          {/* Dialogs */}
        {team && (
          <EditTeamDialog 
            open={editTeamOpen}
            onOpenChange={setEditTeamOpen}
            team={team}
          />
        )}
        
        <AddMemberDialog
          open={addMemberOpen}
          onOpenChange={setAddMemberOpen}
          teamId={teamId}
        />
        
        <EditMemberDialog
          open={!!editingMember}
          onOpenChange={(open) => !open && handleCloseEditMember()}
          teamId={teamId}
          member={editingMember}
        />
        
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
      </div>
    </TeamPermissionGate>
  )
}
