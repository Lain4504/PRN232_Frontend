import { ROLE_PERMISSIONS, getPermissionsForRole } from '@/lib/constants/team-roles'

/**
 * Check if a user has a specific permission based on their role
 */
export function hasPermission(role: string, permission: string): boolean {
  const rolePermissions = getPermissionsForRole(role)
  return rolePermissions.includes(permission)
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(role: string, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(role: string, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: string): string[] {
  return getPermissionsForRole(role)
}

/**
 * Check if a role is a high-privilege role (Owner, Admin, TeamLeader)
 */
export function isHighPrivilegeRole(role: string): boolean {
  return ['Vendor', 'TeamLeader'].includes(role)
}

/**
 * Check if a role can manage team members
 */
export function canManageMembers(role: string): boolean {
  return hasPermission(role, 'ADD_MEMBER') || hasPermission(role, 'REMOVE_MEMBER')
}

/**
 * Check if a role can approve content
 */
export function canApproveContent(role: string): boolean {
  return hasPermission(role, 'APPROVE_CONTENT')
}

/**
 * Check if a role can create content
 */
export function canCreateContent(role: string): boolean {
  return hasPermission(role, 'CREATE_CONTENT')
}

/**
 * Check if a role can schedule posts
 */
export function canSchedulePosts(role: string): boolean {
  return hasPermission(role, 'SCHEDULE_POST')
}

/**
 * Check if a role can view team analytics
 */
export function canViewAnalytics(role: string): boolean {
  return hasPermission(role, 'VIEW_TEAM_ANALYTICS')
}

/**
 * Get permission level for a role (0 = no access, 1 = read, 2 = write, 3 = admin)
 */
export function getPermissionLevel(role: string): number {
  if (role === 'Vendor') return 3
  if (role === 'TeamLeader') return 2
  if (role === 'SocialMediaManager') return 2
  if (role === 'Designer' || role === 'Copywriter') return 1
  return 0
}
