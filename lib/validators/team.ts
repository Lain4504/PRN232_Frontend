// Team Validation Schemas
// Based on Story 3.3 requirements

import { z } from 'zod';

// Team creation and update schemas
export const createTeamSchema = z.object({
  name: z.string()
    .min(2, 'Team name must be at least 2 characters long')
    .max(50, 'Team name must be less than 50 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  settings: z.object({
    allowMemberInvites: z.boolean().default(true),
    requireApprovalForJoins: z.boolean().default(false),
    defaultRole: z.string().default('Member'),
    maxMembers: z.number().min(1).max(100).default(10),
    allowExternalInvites: z.boolean().default(true),
    notificationSettings: z.object({
      emailNotifications: z.boolean().default(true),
      inAppNotifications: z.boolean().default(true),
      memberJoinNotifications: z.boolean().default(true),
      roleChangeNotifications: z.boolean().default(true),
      billingNotifications: z.boolean().default(true),
    }).default({})
  }).optional()
});

export const updateTeamSchema = z.object({
  name: z.string()
    .min(2, 'Team name must be at least 2 characters long')
    .max(50, 'Team name must be less than 50 characters')
    .trim()
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  settings: z.object({
    allowMemberInvites: z.boolean().optional(),
    requireApprovalForJoins: z.boolean().optional(),
    defaultRole: z.string().optional(),
    maxMembers: z.number().min(1).max(100).optional(),
    allowExternalInvites: z.boolean().optional(),
    notificationSettings: z.object({
      emailNotifications: z.boolean().optional(),
      inAppNotifications: z.boolean().optional(),
      memberJoinNotifications: z.boolean().optional(),
      roleChangeNotifications: z.boolean().optional(),
      billingNotifications: z.boolean().optional(),
    }).optional()
  }).optional()
});

// Team member schemas
export const inviteMemberSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  role: z.string()
    .min(1, 'Role is required'),
  message: z.string()
    .max(500, 'Message must be less than 500 characters')
    .optional()
    .or(z.literal(''))
});

export const updateMemberSchema = z.object({
  role: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']).optional()
});

export const addMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.string().min(1, 'Role is required'),
  permissions: z.array(z.string()).optional()
});

// Team invitation schemas
export const resendInvitationSchema = z.object({
  invitationId: z.string().min(1, 'Invitation ID is required')
});

export const acceptInvitationSchema = z.object({
  invitationId: z.string().min(1, 'Invitation ID is required'),
  token: z.string().min(1, 'Token is required')
});

export const rejectInvitationSchema = z.object({
  invitationId: z.string().min(1, 'Invitation ID is required')
});

// Team settings schemas
export const updateTeamSettingsSchema = z.object({
  allowMemberInvites: z.boolean().optional(),
  requireApprovalForJoins: z.boolean().optional(),
  defaultRole: z.string().optional(),
  maxMembers: z.number().min(1).max(100).optional(),
  allowExternalInvites: z.boolean().optional(),
  notificationSettings: z.object({
    emailNotifications: z.boolean().optional(),
    inAppNotifications: z.boolean().optional(),
    memberJoinNotifications: z.boolean().optional(),
    roleChangeNotifications: z.boolean().optional(),
    billingNotifications: z.boolean().optional(),
  }).optional()
});

// Team billing schemas
export const updateTeamBillingSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  billingCycle: z.enum(['monthly', 'yearly']).default('monthly')
});

// Team activity schemas
export const teamActivityFiltersSchema = z.object({
  action: z.string().optional(),
  userId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20)
});

// Team member filters schema
export const teamMemberFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended']).optional(),
  joinedFrom: z.string().optional(),
  joinedTo: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20)
});

// Team invitation filters schema
export const teamInvitationFiltersSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'expired']).optional(),
  role: z.string().optional(),
  invitedFrom: z.string().optional(),
  invitedTo: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20)
});

// Team search schema
export const teamSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  filters: z.object({
    status: z.string().optional(),
    role: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional()
  }).optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20)
});

// Export types
export type CreateTeamFormData = z.infer<typeof createTeamSchema>;
export type UpdateTeamFormData = z.infer<typeof updateTeamSchema>;
export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberFormData = z.infer<typeof updateMemberSchema>;
export type AddMemberFormData = z.infer<typeof addMemberSchema>;
export type ResendInvitationFormData = z.infer<typeof resendInvitationSchema>;
export type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;
export type RejectInvitationFormData = z.infer<typeof rejectInvitationSchema>;
export type UpdateTeamSettingsFormData = z.infer<typeof updateTeamSettingsSchema>;
export type UpdateTeamBillingFormData = z.infer<typeof updateTeamBillingSchema>;
export type TeamActivityFiltersFormData = z.infer<typeof teamActivityFiltersSchema>;
export type TeamMemberFiltersFormData = z.infer<typeof teamMemberFiltersSchema>;
export type TeamInvitationFiltersFormData = z.infer<typeof teamInvitationFiltersSchema>;
export type TeamSearchFormData = z.infer<typeof teamSearchSchema>;
