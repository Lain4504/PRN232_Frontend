import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, endpoints, PaginatedResponse } from '@/lib/api'
import type { Post, PostFilters } from '@/lib/types/aisam-types'

// Query Keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (postId: string) => [...postKeys.details(), postId] as const,
  byContent: (contentId: string) => [...postKeys.all, 'content', contentId] as const,
  byIntegration: (integrationId: string) => [...postKeys.all, 'integration', integrationId] as const,
}

// Get posts with filters
export function usePosts(filters?: PostFilters) {
  const params = new URLSearchParams()
  if (filters?.page) params.set('page', filters.page.toString())
  if (filters?.pageSize) params.set('pageSize', filters.pageSize.toString())
  if (filters?.status) params.set('status', filters.status)
  if (filters?.platform) params.set('platform', filters.platform)
  if (filters?.contentId) params.set('contentId', filters.contentId)
  if (filters?.integrationId) params.set('integrationId', filters.integrationId)

  const queryString = params.toString()

  return useQuery({
    queryKey: [...postKeys.lists(), queryString],
    queryFn: async (): Promise<PaginatedResponse<Post>> => {
      const url = queryString ? `${endpoints.posts.list()}?${queryString}` : endpoints.posts.list()
      const resp = await api.get<PaginatedResponse<Post>>(url)
      return resp.data
    },
  })
}

// Get posts by content ID
export function usePostsByContent(contentId?: string) {
  return useQuery({
    queryKey: contentId ? postKeys.byContent(contentId) : postKeys.lists(),
    queryFn: async (): Promise<Post[]> => {
      const resp = await api.get<Post[]>(endpoints.posts.byContent(contentId!))
      return resp.data
    },
    enabled: !!contentId,
  })
}

// Get posts by integration ID
export function usePostsByIntegration(integrationId?: string) {
  return useQuery({
    queryKey: integrationId ? postKeys.byIntegration(integrationId) : postKeys.lists(),
    queryFn: async (): Promise<Post[]> => {
      const resp = await api.get<Post[]>(endpoints.posts.byIntegration(integrationId!))
      return resp.data
    },
    enabled: !!integrationId,
  })
}
