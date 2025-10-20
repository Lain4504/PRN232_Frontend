'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  UserPlus,
  Mail,
  Shield,
  User,
  Calendar,
  Activity
} from 'lucide-react';
import { TeamMemberResponseDto } from '@/lib/types/aisam-types';
import { getMemberStatusColor, getMemberStatusLabel, formatDate, formatRelativeTime } from '@/lib/utils/teams';

interface TeamMemberListProps {
  teamId: string;
  members: TeamMemberResponseDto[];
  canManage?: boolean;
  onEditMember?: (member: TeamMemberResponseDto) => void;
  onRemoveMember?: (member: TeamMemberResponseDto) => void;
  onInviteMember?: () => void;
  isLoading?: boolean;
}

export function TeamMemberList({ 
  teamId, 
  members, 
  canManage = true, 
  onEditMember, 
  onRemoveMember, 
  onInviteMember,
  isLoading = false 
}: TeamMemberListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredMembers = members.filter(member => {
    const matchesSearch = searchQuery === '' || 
      member.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && member.isActive) ||
      (statusFilter === 'inactive' && !member.isActive);
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Vendor':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'TeamLeader':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'Copywriter':
        return <User className="h-4 w-4 text-green-500" />;
      case 'Designer':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'Marketer':
        return <User className="h-4 w-4 text-orange-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Vendor':
        return 'bg-red-100 text-red-800';
      case 'TeamLeader':
        return 'bg-blue-100 text-blue-800';
      case 'Copywriter':
        return 'bg-green-100 text-green-800';
      case 'Designer':
        return 'bg-purple-100 text-purple-800';
      case 'Marketer':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const activeMembers = members.filter(m => m.isActive).length;
  const totalMembers = members.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Loading team members...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>
          <p className="text-muted-foreground">
            Manage your team members and their access levels
          </p>
        </div>
        {canManage && onInviteMember && (
          <Button onClick={onInviteMember}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalMembers}</div>
                <div className="text-sm text-muted-foreground">Total Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeMembers}</div>
                <div className="text-sm text-muted-foreground">Active Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalMembers - activeMembers}</div>
                <div className="text-sm text-muted-foreground">Inactive Members</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Member List</CardTitle>
          <CardDescription>
            View and manage your team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Vendor">Vendor</SelectItem>
                <SelectItem value="TeamLeader">Team Leader</SelectItem>
                <SelectItem value="Copywriter">Copywriter</SelectItem>
                <SelectItem value="Designer">Designer</SelectItem>
                <SelectItem value="Marketer">Marketer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Members Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Permissions</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 6 : 5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="h-8 w-8" />
                        <div>No members found</div>
                        {searchQuery && (
                          <div className="text-sm">Try adjusting your search criteria</div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getInitials(member.userEmail)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.userEmail}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.userId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(member.role)}
                          <Badge className={getRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getMemberStatusColor(member.isActive ? 'active' : 'inactive')}>
                          {getMemberStatusLabel(member.isActive ? 'active' : 'inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(member.joinedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {member.permissions?.length || 0} permissions
                        </Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {onEditMember && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEditMember(member)}
                              >
                                Edit
                              </Button>
                            )}
                            {onRemoveMember && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRemoveMember(member)}
                                className="text-destructive hover:text-destructive"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
