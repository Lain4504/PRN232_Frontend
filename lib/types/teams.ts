// Team Management Types
// Based on Story 3.3 requirements and existing implementation

export interface Team {
  id: string;
  name: string;
  description?: string;
  settings: TeamSettings;
  billing: TeamBilling;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  status: TeamMemberStatus;
  joinedAt: string;
  permissions: string[];
  lastActiveAt?: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  teamId: string;
  role: TeamRole;
  status: TeamInvitationStatus;
  expiresAt: string;
  invitedBy: string;
  invitedAt: string;
}

export interface TeamRole {
  id: string;
  name: string;
  permissions: string[];
  description: string;
  isDefault: boolean;
}

export interface TeamActivity {
  id: string;
  teamId: string;
  userId: string;
  action: TeamActivityAction;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface TeamSettings {
  allowMemberInvites: boolean;
  requireApprovalForJoins: boolean;
  defaultRole: string;
  maxMembers: number;
  allowExternalInvites: boolean;
  notificationSettings: TeamNotificationSettings;
}

export interface TeamBilling {
  subscriptionId?: string;
  planId: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usage: TeamUsage;
  limits: TeamLimits;
}

export interface TeamUsage {
  members: number;
  storage: number; // in MB
  apiCalls: number;
  contentGenerations: number;
}

export interface TeamLimits {
  maxMembers: number;
  maxStorage: number; // in MB
  maxApiCalls: number;
  maxContentGenerations: number;
}

export interface TeamNotificationSettings {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  memberJoinNotifications: boolean;
  roleChangeNotifications: boolean;
  billingNotifications: boolean;
}

// Enums
export type TeamMemberStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type TeamInvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';
export type TeamActivityAction = 
  | 'member_added'
  | 'member_removed'
  | 'member_role_changed'
  | 'member_permissions_changed'
  | 'team_created'
  | 'team_updated'
  | 'team_deleted'
  | 'invitation_sent'
  | 'invitation_accepted'
  | 'invitation_rejected'
  | 'billing_updated'
  | 'settings_changed';

// Form types
export interface CreateTeamForm {
  name: string;
  description?: string;
  settings?: Partial<TeamSettings>;
}

export interface UpdateTeamForm {
  name?: string;
  description?: string;
  settings?: Partial<TeamSettings>;
}

export interface InviteMemberForm {
  email: string;
  role: string;
  message?: string;
}

export interface UpdateMemberForm {
  role?: string;
  permissions?: string[];
  status?: TeamMemberStatus;
}

// API Response types
export interface TeamListResponse {
  teams: Team[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TeamMemberListResponse {
  members: TeamMember[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TeamInvitationListResponse {
  invitations: TeamInvitation[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TeamActivityListResponse {
  activities: TeamActivity[];
  total: number;
  page: number;
  pageSize: number;
}

// Filter types
export interface TeamFilters {
  search?: string;
  status?: string;
  role?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TeamMemberFilters {
  search?: string;
  role?: string;
  status?: TeamMemberStatus;
  joinedFrom?: string;
  joinedTo?: string;
}

export interface TeamInvitationFilters {
  status?: TeamInvitationStatus;
  role?: string;
  invitedFrom?: string;
  invitedTo?: string;
}

// Analytics types
export interface TeamAnalytics {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  recentActivity: TeamActivity[];
  memberGrowth: {
    date: string;
    count: number;
  }[];
  roleDistribution: {
    role: string;
    count: number;
  }[];
  activitySummary: {
    action: TeamActivityAction;
    count: number;
  }[];
}
