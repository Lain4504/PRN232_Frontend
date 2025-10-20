import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, endpoints, PaginatedResponse } from '@/lib/api'
import type {
  AssignBrandToTeamRequest,
  UnassignBrandFromTeamRequest,
  CreateTeamRequest,
  PaginationRequest,
  TeamMemberCreateRequest,
  TeamMemberResponseDto,
  TeamMemberUpdateRequest,
  TeamResponse,
  UpdateTeamStatusRequest,
} from '@/lib/types/aisam-types'

// Query Keys
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  listByVendor: (vendorId: string) => [...teamKeys.lists(), 'vendor', vendorId] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (teamId: string) => [...teamKeys.details(), teamId] as const,
  members: (teamId: string) => [...teamKeys.detail(teamId), 'members'] as const,
}

// Teams by vendor
export function useTeamsByVendor(vendorId?: string) {
  return useQuery({
    queryKey: vendorId ? teamKeys.listByVendor(vendorId) : teamKeys.lists(),
    queryFn: async (): Promise<TeamResponse[]> => {
      if (!vendorId) return []
      const resp = await api.get<TeamResponse[]>(endpoints.teamsByVendor(vendorId))
      return resp.data
    },
    enabled: !!vendorId,
  })
}

// Team detail
export function useTeam(teamId?: string) {
  return useQuery({
    queryKey: teamId ? teamKeys.detail(teamId) : teamKeys.details(),
    queryFn: async (): Promise<TeamResponse> => {
      const resp = await api.get<TeamResponse>(endpoints.teamById(teamId!))
      return resp.data
    },
    enabled: !!teamId,
    retry: (count, err) => {
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) return false
      return count < 2
    },
  })
}

// User permissions for team operations
export function useUserPermissions(teamId?: string) {
  return useQuery({
    queryKey: ['user-permissions', teamId],
    queryFn: async (): Promise<{ canManageTeams: boolean; canAssignBrands: boolean }> => {
      try {
        // Fetch team members to get current user's permissions
        const resp = await api.get<TeamMemberResponseDto[]>(endpoints.teamMembers(teamId!))
        const members = resp.data

        // Find current user's member record (assuming we can get userId from auth)
        // For now, we'll check if user has permissions in any team member record
        // In a real app, you'd get the current user ID from auth context
        const hasManageTeams = members.some(member =>
          member.permissions?.includes('UPDATE_TEAM') || member.permissions?.includes('DELETE_TEAM')
        )
        const hasAssignBrands = members.some(member =>
          member.permissions?.includes('UPDATE_TEAM')
        )

        return {
          canManageTeams: hasManageTeams,
          canAssignBrands: hasAssignBrands,
        }
      } catch (error) {
        // If API fails, default to false for security
        console.error('Failed to fetch user permissions:', error)
        return { canManageTeams: false, canAssignBrands: false }
      }
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create team
export function useCreateTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateTeamRequest): Promise<TeamResponse> => {
      const resp = await api.post<TeamResponse>(endpoints.createTeam(), payload)
      return resp.data
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: teamKeys.lists() })
      if (created.vendorId) {
        qc.invalidateQueries({ queryKey: teamKeys.listByVendor(created.vendorId) })
      }
    },
  })
}

// Update team (reuse CreateTeamRequest)
export function useUpdateTeam(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateTeamRequest): Promise<TeamResponse> => {
      const resp = await api.put<TeamResponse>(endpoints.teamById(teamId), payload)
      return resp.data
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: teamKeys.detail(teamId) })
      qc.invalidateQueries({ queryKey: teamKeys.lists() })
      if (updated.vendorId) {
        qc.invalidateQueries({ queryKey: teamKeys.listByVendor(updated.vendorId) })
      }
    },
  })
}

// Delete team (soft delete)
export function useDeleteTeam(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.teamById(teamId))
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamKeys.detail(teamId) })
      qc.invalidateQueries({ queryKey: teamKeys.lists() })
    },
  })
}

// Restore team
export function useRestoreTeam(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.post<boolean>(endpoints.teamRestore(teamId))
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: teamKeys.detail(teamId) })
      qc.invalidateQueries({ queryKey: teamKeys.lists() })
    },
  })
}

// Update team status
export function useUpdateTeamStatus(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateTeamStatusRequest): Promise<boolean> => {
      const resp = await api.patch<boolean>(endpoints.teamStatus(teamId), payload as unknown as Record<string, unknown>)
      return resp.data
    },
    onMutate: async (payload) => {
      const key = teamKeys.detail(teamId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<TeamResponse>(key)
      if (prev) {
        qc.setQueryData<TeamResponse>(key, { ...prev, status: payload.status })
      }
      return { prev }
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(teamKeys.detail(teamId), ctx.prev)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: teamKeys.detail(teamId) })
    },
  })
}

// Assign brands
export function useAssignBrands(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AssignBrandToTeamRequest): Promise<boolean> => {
      const resp = await api.post<boolean>(endpoints.teamAssignBrands(teamId), payload)
      return resp.data
    },
    onSuccess: () => {
      // Invalidate team detail and teams list to update brand assignments
      qc.invalidateQueries({ queryKey: teamKeys.detail(teamId) })
      qc.invalidateQueries({ queryKey: teamKeys.lists() })
    },
  })
}

// Unassign brand
export function useUnassignBrand(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UnassignBrandFromTeamRequest): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.teamUnassignBrand(teamId), payload)
      return resp.data
    },
    onSuccess: () => {
      // Invalidate team detail and teams list to update brand assignments
      qc.invalidateQueries({ queryKey: teamKeys.detail(teamId) })
      qc.invalidateQueries({ queryKey: teamKeys.lists() })
    },
  })
}

// Team members list
export function useTeamMembers(teamId?: string) {
  return useQuery({
    queryKey: teamId ? teamKeys.members(teamId) : teamKeys.details(),
    queryFn: async (): Promise<TeamMemberResponseDto[]> => {
      const resp = await api.get<TeamMemberResponseDto[]>(endpoints.teamMembers(teamId!))
      return resp.data
    },
    enabled: !!teamId,
  })
}

// Add team member
export function useAddTeamMember(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: TeamMemberCreateRequest): Promise<TeamMemberResponseDto> => {
      const resp = await api.post<TeamMemberResponseDto>(endpoints.createTeamMember(), payload)
      return resp.data
    },
    onSuccess: () => {
      // Invalidate team members, team detail, and teams list to update member counts
      qc.invalidateQueries({ queryKey: teamKeys.members(teamId) })
      qc.invalidateQueries({ queryKey: teamKeys.detail(teamId) })
      qc.invalidateQueries({ queryKey: teamKeys.lists() })
    },
  })
}

// Update team member
export function useUpdateTeamMember(teamId: string, memberId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: TeamMemberUpdateRequest): Promise<TeamMemberResponseDto> => {
      const resp = await api.put<TeamMemberResponseDto>(endpoints.updateTeamMember(memberId), payload)
      return resp.data
    },
    onSuccess: () => {
      // Invalidate team members, team detail, and teams list to update member counts
      qc.invalidateQueries({ queryKey: teamKeys.members(teamId) })
      qc.invalidateQueries({ queryKey: teamKeys.detail(teamId) })
      qc.invalidateQueries({ queryKey: teamKeys.lists() })
    },
  })
}

// Delete team member
export function useDeleteTeamMember(teamId: string, memberId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.deleteTeamMember(memberId))
      return resp.data
    },
    onSuccess: () => {
      // Invalidate team members, team detail, and teams list to update member counts
      qc.invalidateQueries({ queryKey: teamKeys.members(teamId) })
      qc.invalidateQueries({ queryKey: teamKeys.detail(teamId) })
      qc.invalidateQueries({ queryKey: teamKeys.lists() })
    },
  })
}

// Admin: team members paged list
export function usePagedTeamMembers(params?: PaginationRequest) {
  const search = new URLSearchParams()
  if (params?.page) search.set('page', String(params.page))
  if (params?.pageSize) search.set('pageSize', String(params.pageSize))
  if (params?.teamId) search.set('teamId', params.teamId)
  if (params?.vendorId) search.set('vendorId', params.vendorId)
  if (params?.role) search.set('role', params.role)
  if (params?.status) search.set('status', params.status)

  const query = search.toString()

  return useQuery({
    queryKey: ['team-members', query],
    queryFn: async (): Promise<PaginatedResponse<TeamMemberResponseDto>> => {
      const url = `${endpoints.teamMembersPaged()}${query ? `?${query}` : ''}`
      const resp = await api.get<PaginatedResponse<TeamMemberResponseDto>>(url)
      return resp.data
    },
  })
}