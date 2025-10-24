import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, endpoints, PaginatedResponse } from '@/lib/api'
import type { Post, PostFilters, BrandResponseDto } from '@/lib/types/aisam-types'

// Query Keys
export const teamPostKeys = {
  all: ['team-posts'] as const,
  lists: () => [...teamPostKeys.all, 'list'] as const,
  byTeam: (teamId: string) => [...teamPostKeys.lists(), 'team', teamId] as const,
  scheduled: (teamId: string) => [...teamPostKeys.all, 'scheduled', teamId] as const,
}

// Get posts for team brands
export function useTeamPosts(teamId?: string, filters?: PostFilters) {
  const params = new URLSearchParams()
  if (filters?.page) params.set('page', filters.page.toString())
  if (filters?.pageSize) params.set('pageSize', filters.pageSize.toString())
  if (filters?.status) params.set('status', filters.status)
  if (filters?.platform) params.set('platform', filters.platform)
  if (filters?.contentId) params.set('contentId', filters.contentId)
  if (filters?.integrationId) params.set('integrationId', filters.integrationId)
  if (filters?.brandId) params.set('brandId', filters.brandId)

  const queryString = params.toString()

  return useQuery({
    queryKey: teamId ? [...teamPostKeys.byTeam(teamId), queryString] : teamPostKeys.lists(),
    queryFn: async (): Promise<PaginatedResponse<Post>> => {
      if (!teamId) return { data: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
      
      // If specific brandId is provided, use it directly
      if (filters?.brandId) {
        const url = queryString ? `${endpoints.posts.list()}?${queryString}` : `${endpoints.posts.list()}?brandId=${filters.brandId}`
        const resp = await api.get<PaginatedResponse<Post>>(url)
        return resp.data
      }
      
      // Otherwise, get all team brands
      const brandsResp = await api.get<BrandResponseDto[]>(`/brands/team/${teamId}`)
      const brandIds = brandsResp.data.map(brand => brand.id)
      
      if (brandIds.length === 0) {
        return { data: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
      }

      // Get posts for all team brands
      const brandIdParams = brandIds.map(id => `brandId=${id}`).join('&')
      const url = queryString ? `${endpoints.posts.list()}?${queryString}&${brandIdParams}` : `${endpoints.posts.list()}?${brandIdParams}`
      
      const resp = await api.get<PaginatedResponse<Post>>(url)
      return resp.data
    },
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get scheduled posts for team
export function useTeamScheduledPosts(teamId?: string) {
  return useQuery({
    queryKey: teamId ? teamPostKeys.scheduled(teamId) : teamPostKeys.lists(),
    queryFn: async (): Promise<Post[]> => {
      if (!teamId) return []
      
      // Get team brands first
      const brandsResp = await api.get<BrandResponseDto[]>(`/brands/team/${teamId}`)
      const brandIds = brandsResp.data.map(brand => brand.id)
      
      if (brandIds.length === 0) return []

      // Get scheduled posts for team brands
      const brandIdParams = brandIds.map(id => `brandId=${id}`).join('&')
      const url = `${endpoints.posts.list()}?${brandIdParams}&status=Scheduled`
      
      const resp = await api.get<PaginatedResponse<Post>>(url)
      return resp.data.data
    },
    enabled: !!teamId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Get team posts by content ID
export function useTeamPostsByContent(teamId?: string, contentId?: string) {
  return useQuery({
    queryKey: teamId && contentId ? [...teamPostKeys.byTeam(teamId), 'content', contentId] : teamPostKeys.lists(),
    queryFn: async (): Promise<Post[]> => {
      if (!teamId || !contentId) return []
      
      const resp = await api.get<Post[]>(endpoints.posts.byContent(contentId))
      return resp.data
    },
    enabled: !!teamId && !!contentId,
  })
}

// Delete team post
export function useDeleteTeamPost(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (postId: string): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.posts.byId(postId))
      return resp.data
    },
    onSuccess: () => {
      // Invalidate team post queries
      qc.invalidateQueries({ queryKey: teamPostKeys.byTeam(teamId) })
      qc.invalidateQueries({ queryKey: teamPostKeys.scheduled(teamId) })
    },
  })
}

// Publish team post
export function usePublishTeamPost(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ contentId, integrationId }: { contentId: string; integrationId: string }): Promise<any> => {
      const resp = await api.post<any>(endpoints.contentPublish(contentId, integrationId))
      return resp.data
    },
    onSuccess: () => {
      // Invalidate team post queries
      qc.invalidateQueries({ queryKey: teamPostKeys.byTeam(teamId) })
      qc.invalidateQueries({ queryKey: teamPostKeys.scheduled(teamId) })
    },
  })
}
