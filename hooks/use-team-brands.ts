import { useQuery } from '@tanstack/react-query'
import { api, endpoints } from '@/lib/api'
import type { BrandResponseDto } from '@/lib/types/aisam-types'

// Query Keys
export const teamBrandKeys = {
  all: ['team-brands'] as const,
  lists: () => [...teamBrandKeys.all, 'list'] as const,
  byTeam: (teamId: string) => [...teamBrandKeys.lists(), 'team', teamId] as const,
  byTeamMembership: () => [...teamBrandKeys.lists(), 'membership'] as const,
}

// Get brands assigned to a specific team
export function useTeamBrands(teamId?: string) {
  return useQuery({
    queryKey: teamId ? teamBrandKeys.byTeam(teamId) : teamBrandKeys.lists(),
    queryFn: async (): Promise<BrandResponseDto[]> => {
      if (!teamId) return []
      const resp = await api.get<BrandResponseDto[]>(`/brands/team/${teamId}`)
      return resp.data
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get brands accessible by current user through team membership
export function useBrandsByTeamMembership() {
  return useQuery({
    queryKey: teamBrandKeys.byTeamMembership(),
    queryFn: async (): Promise<BrandResponseDto[]> => {
      const resp = await api.get<BrandResponseDto[]>('/brands/team')
      return resp.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
