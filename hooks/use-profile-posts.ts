import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, endpoints, PaginatedResponse } from '@/lib/api'
import type { Post, PostFilters, Brand } from '@/lib/types/aisam-types'

// Query Keys
export const profilePostKeys = {
  all: ['profile-posts'] as const,
  lists: () => [...profilePostKeys.all, 'list'] as const,
  byProfile: (profileId: string) => [...profilePostKeys.lists(), 'profile', profileId] as const,
  scheduled: (profileId: string) => [...profilePostKeys.all, 'scheduled', profileId] as const,
}

// Get posts for profile brands
export function useProfilePosts(profileId?: string, filters?: PostFilters) {
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
    queryKey: profileId ? [...profilePostKeys.byProfile(profileId), queryString] : profilePostKeys.lists(),
    queryFn: async (): Promise<PaginatedResponse<Post>> => {
      if (!profileId) return { data: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
      
      // If specific brandId is provided, use it directly
      if (filters?.brandId) {
        const url = queryString ? `${endpoints.posts.list()}?${queryString}` : `${endpoints.posts.list()}?brandId=${filters.brandId}`
        const resp = await api.get<PaginatedResponse<Post>>(url)
        return resp.data
      }
      
      // Get profile brands first - use the brands endpoint that returns brands for the active profile
      const brandsResp = await api.get<Brand[]>(endpoints.brands())
      const brandIds = brandsResp.data.map(brand => brand.id)
      
      if (brandIds.length === 0) {
        return { data: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
      }

      // Get posts for all profile brands
      const brandIdParams = brandIds.map(id => `brandId=${id}`).join('&')
      const url = queryString ? `${endpoints.posts.list()}?${queryString}&${brandIdParams}` : `${endpoints.posts.list()}?${brandIdParams}`
      
      const resp = await api.get<PaginatedResponse<Post>>(url)
      return resp.data
    },
    enabled: !!profileId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get scheduled posts for profile
export function useProfileScheduledPosts(profileId?: string) {
  return useQuery({
    queryKey: profileId ? profilePostKeys.scheduled(profileId) : profilePostKeys.lists(),
    queryFn: async (): Promise<Post[]> => {
      if (!profileId) return []
      
      // Get profile brands first - use the brands endpoint that returns brands for the active profile
      const brandsResp = await api.get<Brand[]>(endpoints.brands())
      const brandIds = brandsResp.data.map(brand => brand.id)
      
      if (brandIds.length === 0) return []

      // Get scheduled posts for profile brands
      const brandIdParams = brandIds.map(id => `brandId=${id}`).join('&')
      const url = `${endpoints.posts.list()}?${brandIdParams}&status=Scheduled`
      
      const resp = await api.get<PaginatedResponse<Post>>(url)
      return resp.data.data
    },
    enabled: !!profileId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Get profile posts by content ID
export function useProfilePostsByContent(profileId?: string, contentId?: string) {
  return useQuery({
    queryKey: profileId && contentId ? [...profilePostKeys.byProfile(profileId), 'content', contentId] : profilePostKeys.lists(),
    queryFn: async (): Promise<Post[]> => {
      if (!profileId || !contentId) return []
      
      const resp = await api.get<Post[]>(endpoints.posts.byContent(contentId))
      return resp.data
    },
    enabled: !!profileId && !!contentId,
  })
}

// Delete profile post
export function useDeleteProfilePost(profileId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (postId: string): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.posts.byId(postId))
      return resp.data
    },
    onSuccess: () => {
      // Invalidate profile post queries
      qc.invalidateQueries({ queryKey: profilePostKeys.byProfile(profileId) })
      qc.invalidateQueries({ queryKey: profilePostKeys.scheduled(profileId) })
    },
  })
}

// Publish profile post
export function usePublishProfilePost(profileId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ contentId, integrationId }: { contentId: string; integrationId: string }): Promise<any> => {
      const resp = await api.post<any>(endpoints.contentPublish(contentId, integrationId))
      return resp.data
    },
    onSuccess: () => {
      // Invalidate profile post queries
      qc.invalidateQueries({ queryKey: profilePostKeys.byProfile(profileId) })
      qc.invalidateQueries({ queryKey: profilePostKeys.scheduled(profileId) })
    },
  })
}
