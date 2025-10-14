import { createClient } from '@/lib/supabase/client'

export type UserRole = 'admin' | 'vendor' | 'user' | 'viewer'

export interface Permissions {
  role: UserRole
  canManageTeams: boolean
  canManageMembers: boolean
  canAssignBrands: boolean
  canChangeStatus: boolean
}

export async function getCurrentPermissions(): Promise<Permissions> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const role = (session?.user?.user_metadata?.role as UserRole) || 'user'
  const isAdmin = role === 'admin'
  const isVendor = role === 'vendor'
  return {
    role,
    canManageTeams: isAdmin || isVendor,
    canManageMembers: isAdmin || isVendor,
    canAssignBrands: isAdmin || isVendor,
    canChangeStatus: isAdmin || isVendor,
  }
}