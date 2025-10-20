// Team Management Utility Functions
// Based on Story 3.3 requirements

import { TeamMember, TeamInvitation, TeamActivity, TeamAnalytics } from '@/lib/types/teams';
import { TeamMemberStatus, TeamInvitationStatus, TeamActivityAction } from '@/lib/types/teams';

// Team member utilities
export const getMemberDisplayName = (member: TeamMember): string => {
  return member.userId || 'Unknown User';
};

export const getMemberStatusColor = (status: TeamMemberStatus): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'suspended':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getMemberStatusLabel = (status: TeamMemberStatus): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'pending':
      return 'Pending';
    case 'suspended':
      return 'Suspended';
    default:
      return 'Unknown';
  }
};

// Team invitation utilities
export const getInvitationStatusColor = (status: TeamInvitationStatus): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getInvitationStatusLabel = (status: TeamInvitationStatus): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'accepted':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'expired':
      return 'Expired';
    default:
      return 'Unknown';
  }
};

export const isInvitationExpired = (invitation: TeamInvitation): boolean => {
  return new Date(invitation.expiresAt) < new Date();
};

// Team activity utilities
export const getActivityActionLabel = (action: TeamActivityAction): string => {
  switch (action) {
    case 'member_added':
      return 'Member Added';
    case 'member_removed':
      return 'Member Removed';
    case 'member_role_changed':
      return 'Role Changed';
    case 'member_permissions_changed':
      return 'Permissions Changed';
    case 'team_created':
      return 'Team Created';
    case 'team_updated':
      return 'Team Updated';
    case 'team_deleted':
      return 'Team Deleted';
    case 'invitation_sent':
      return 'Invitation Sent';
    case 'invitation_accepted':
      return 'Invitation Accepted';
    case 'invitation_rejected':
      return 'Invitation Rejected';
    case 'billing_updated':
      return 'Billing Updated';
    case 'settings_changed':
      return 'Settings Changed';
    default:
      return 'Unknown Action';
  }
};

export const getActivityActionIcon = (action: TeamActivityAction): string => {
  switch (action) {
    case 'member_added':
      return 'user-plus';
    case 'member_removed':
      return 'user-minus';
    case 'member_role_changed':
      return 'user-cog';
    case 'member_permissions_changed':
      return 'shield';
    case 'team_created':
      return 'plus-circle';
    case 'team_updated':
      return 'edit';
    case 'team_deleted':
      return 'trash';
    case 'invitation_sent':
      return 'mail';
    case 'invitation_accepted':
      return 'check-circle';
    case 'invitation_rejected':
      return 'x-circle';
    case 'billing_updated':
      return 'credit-card';
    case 'settings_changed':
      return 'settings';
    default:
      return 'activity';
  }
};

// Team analytics utilities
export const calculateTeamAnalytics = (
  members: TeamMember[],
  invitations: TeamInvitation[],
  activities: TeamActivity[]
): TeamAnalytics => {
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const pendingInvitations = invitations.filter(i => i.status === 'pending').length;

  // Get recent activity (last 10)
  const recentActivity = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  // Calculate member growth over last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const memberGrowth = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const count = members.filter(m => 
      new Date(m.joinedAt).toISOString().split('T')[0] <= dateStr
    ).length;
    
    memberGrowth.push({ date: dateStr, count });
  }

  // Calculate role distribution
  const roleDistribution = members.reduce((acc, member) => {
    const existing = acc.find(r => r.role === member.role);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ role: member.role, count: 1 });
    }
    return acc;
  }, [] as { role: string; count: number }[]);

  // Calculate activity summary
  const activitySummary = activities.reduce((acc, activity) => {
    const existing = acc.find(a => a.action === activity.action);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ action: activity.action, count: 1 });
    }
    return acc;
  }, [] as { action: TeamActivityAction; count: number }[]);

  return {
    totalMembers,
    activeMembers,
    pendingInvitations,
    recentActivity,
    memberGrowth,
    roleDistribution,
    activitySummary
  };
};

// Team validation utilities
export const validateTeamName = (name: string): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Team name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Team name must be at least 2 characters long' };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Team name must be less than 50 characters' };
  }
  
  return { isValid: true };
};

export const validateTeamDescription = (description?: string): { isValid: boolean; error?: string } => {
  if (description && description.length > 500) {
    return { isValid: false, error: 'Description must be less than 500 characters' };
  }
  
  return { isValid: true };
};

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

// Team permission utilities
export const canManageTeam = (userPermissions: string[]): boolean => {
  return userPermissions.includes('UPDATE_TEAM') || userPermissions.includes('DELETE_TEAM');
};

export const canManageMembers = (userPermissions: string[]): boolean => {
  return userPermissions.includes('ADD_MEMBER') || 
         userPermissions.includes('REMOVE_MEMBER') || 
         userPermissions.includes('UPDATE_MEMBER_ROLE');
};

export const canInviteMembers = (userPermissions: string[]): boolean => {
  return userPermissions.includes('INVITE_MEMBER');
};

export const canViewAnalytics = (userPermissions: string[]): boolean => {
  return userPermissions.includes('VIEW_TEAM_ANALYTICS');
};

// Team formatting utilities
export const formatTeamSize = (count: number): string => {
  if (count === 0) return 'No members';
  if (count === 1) return '1 member';
  return `${count} members`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (date: string): string => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  return formatDate(date);
};

// Currency formatting utility
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};