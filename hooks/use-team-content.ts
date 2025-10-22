import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, endpoints, PaginatedResponse } from '@/lib/api'
import type {
  ContentResponseDto,
  CreateContentRequest,
  ContentFilters,
  BrandResponseDto,
} from '@/lib/types/aisam-types'

// Query Keys
export const teamContentKeys = {
  all: ['team-content'] as const,
  lists: () => [...teamContentKeys.all, 'list'] as const,
  byTeam: (teamId: string) => [...teamContentKeys.lists(), 'team', teamId] as const,
  stats: (teamId: string) => [...teamContentKeys.all, 'stats', teamId] as const,
}

// Get contents for team brands
export function useTeamContents(teamId?: string, filters?: ContentFilters) {
  const params = new URLSearchParams()
  if (filters?.page) params.set('page', filters.page.toString())
  if (filters?.pageSize) params.set('pageSize', filters.pageSize.toString())
  if (filters?.searchTerm) params.set('searchTerm', filters.searchTerm)
  if (filters?.sortBy) params.set('sortBy', filters.sortBy)
  if (filters?.sortDescending !== undefined) params.set('sortDescending', filters.sortDescending.toString())
  if (filters?.adType) params.set('adType', filters.adType)
  if (filters?.onlyDeleted !== undefined) params.set('onlyDeleted', filters.onlyDeleted.toString())
  if (filters?.status) params.set('status', filters.status)

  const queryString = params.toString()

  return useQuery({
    queryKey: teamId ? [...teamContentKeys.byTeam(teamId), queryString] : teamContentKeys.lists(),
    queryFn: async (): Promise<PaginatedResponse<ContentResponseDto>> => {
      if (!teamId) return { data: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
      
      // First get team brands
      const brandsResp = await api.get<BrandResponseDto[]>(`/brands/team/${teamId}`)
      const brandIds = brandsResp.data.map(brand => brand.id)
      
      if (brandIds.length === 0) {
        return { data: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
      }

      // Get contents for all team brands
      const brandIdParams = brandIds.map(id => `brandId=${id}`).join('&')
      const url = queryString ? `${endpoints.contents()}?${queryString}&${brandIdParams}` : `${endpoints.contents()}?${brandIdParams}`
      
      const resp = await api.get<PaginatedResponse<ContentResponseDto>>(url)
      return resp.data
    },
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get team content statistics
export function useTeamContentStats(teamId?: string) {
  return useQuery({
    queryKey: teamId ? teamContentKeys.stats(teamId) : teamContentKeys.all,
    queryFn: async (): Promise<{
      totalContents: number
      draftContents: number
      pendingApprovals: number
      publishedContents: number
      recentContents: ContentResponseDto[]
    }> => {
      if (!teamId) {
        return {
          totalContents: 0,
          draftContents: 0,
          pendingApprovals: 0,
          publishedContents: 0,
          recentContents: []
        }
      }

      // Get team brands first
      const brandsResp = await api.get<BrandResponseDto[]>(`/brands/team/${teamId}`)
      const brandIds = brandsResp.data.map(brand => brand.id)
      
      if (brandIds.length === 0) {
        return {
          totalContents: 0,
          draftContents: 0,
          pendingApprovals: 0,
          publishedContents: 0,
          recentContents: []
        }
      }

      // Get all contents for team brands
      const brandIdParams = brandIds.map(id => `brandId=${id}`).join('&')
      const contentsResp = await api.get<PaginatedResponse<ContentResponseDto>>(`${endpoints.contents()}?${brandIdParams}&pageSize=100`)
      const contents = contentsResp.data.data

      // Calculate statistics
      const totalContents = contents.length
      const draftContents = contents.filter(c => c.status === 'Draft').length
      const publishedContents = contents.filter(c => c.status === 'Published').length
      const pendingApprovals = contents.filter(c => c.status === 'PendingApproval').length
      const recentContents = contents
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      return {
        totalContents,
        draftContents,
        pendingApprovals,
        publishedContents,
        recentContents
      }
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Create content for team
export function useCreateTeamContent(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateContentRequest): Promise<ContentResponseDto> => {
      const resp = await api.post<ContentResponseDto>(endpoints.contents(), payload)
      return resp.data
    },
    onSuccess: () => {
      // Invalidate team content queries
      qc.invalidateQueries({ queryKey: teamContentKeys.byTeam(teamId) })
      qc.invalidateQueries({ queryKey: teamContentKeys.stats(teamId) })
    },
  })
}
