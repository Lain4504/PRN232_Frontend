import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, endpoints, PaginatedResponse, ApiResponse } from '@/lib/api'
import type {
  ContentResponseDto,
  CreateContentRequest,
  UpdateContentRequest,
  ContentFilters,
  PublishResultDto,
  ApprovalResponseDto,
} from '@/lib/types/aisam-types'

// Query Keys
export const contentKeys = {
  all: ['contents'] as const,
  lists: () => [...contentKeys.all, 'list'] as const,
  details: () => [...contentKeys.all, 'detail'] as const,
  detail: (contentId: string) => [...contentKeys.details(), contentId] as const,
  byBrand: (brandId: string) => [...contentKeys.all, 'brand', brandId] as const,
}

// Get contents with filters
export function useContents(filters?: ContentFilters) {
  const params = new URLSearchParams()
  if (filters?.brandId) params.set('brandId', filters.brandId)
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
    queryKey: [...contentKeys.lists(), queryString],
    queryFn: async (): Promise<PaginatedResponse<ContentResponseDto>> => {
      const url = queryString ? `${endpoints.contents()}?${queryString}` : endpoints.contents()
      const resp = await api.get<ApiResponse<PaginatedResponse<ContentResponseDto>>>(url)
      return resp.data.data
    },
  })
}

// Get content by ID
export function useContent(contentId?: string) {
  return useQuery({
    queryKey: contentId ? contentKeys.detail(contentId) : contentKeys.details(),
    queryFn: async (): Promise<ContentResponseDto> => {
      const resp = await api.get<ApiResponse<ContentResponseDto>>(endpoints.contentById(contentId!))
      return resp.data.data
    },
    enabled: !!contentId,
    retry: (count, err) => {
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) return false
      return count < 2
    },
  })
}

// Get contents by brand ID
export function useContentsByBrand(brandId?: string, filters?: Omit<ContentFilters, 'brandId'>) {
  const contentFilters: ContentFilters = {
    ...filters,
    brandId,
  }

  return useQuery({
    queryKey: brandId ? [...contentKeys.byBrand(brandId), filters] : contentKeys.lists(),
    queryFn: async (): Promise<PaginatedResponse<ContentResponseDto>> => {
      const params = new URLSearchParams()
      if (brandId) params.set('brandId', brandId)
      if (filters?.page) params.set('page', filters.page.toString())
      if (filters?.pageSize) params.set('pageSize', filters.pageSize.toString())
      if (filters?.searchTerm) params.set('searchTerm', filters.searchTerm)
      if (filters?.sortBy) params.set('sortBy', filters.sortBy)
      if (filters?.sortDescending !== undefined) params.set('sortDescending', filters.sortDescending.toString())
      if (filters?.adType) params.set('adType', filters.adType)
      if (filters?.onlyDeleted !== undefined) params.set('onlyDeleted', filters.onlyDeleted.toString())
      if (filters?.status) params.set('status', filters.status)

      const queryString = params.toString()
      const url = queryString ? `${endpoints.contents()}?${queryString}` : endpoints.contents()
      const resp = await api.get<ApiResponse<PaginatedResponse<ContentResponseDto>>>(url)
      return resp.data.data
    },
    enabled: !!brandId,
  })
}

// Create content
export function useCreateContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateContentRequest): Promise<ContentResponseDto> => {
      const resp = await api.post<ApiResponse<ContentResponseDto>>(endpoints.contents(), payload)
      console.log('Create content response:', resp.data)
      return resp.data.data
    },
    onSuccess: (created) => {
      console.log('Created content object:', created)
      qc.invalidateQueries({ queryKey: contentKeys.lists() })
      if (created && created.brandId) {
        qc.invalidateQueries({ queryKey: contentKeys.byBrand(created.brandId) })
      }
    },
  })
}

// Update content
export function useUpdateContent(contentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateContentRequest): Promise<ContentResponseDto> => {
      const resp = await api.put<ApiResponse<ContentResponseDto>>(endpoints.contentById(contentId), payload)
      return resp.data.data
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: contentKeys.detail(contentId) })
      qc.invalidateQueries({ queryKey: contentKeys.lists() })
      if (updated.brandId) {
        qc.invalidateQueries({ queryKey: contentKeys.byBrand(updated.brandId) })
      }
    },
  })
}

// Delete content (soft delete)
export function useDeleteContent(contentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.contentById(contentId))
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentKeys.detail(contentId) })
      qc.invalidateQueries({ queryKey: contentKeys.lists() })
    },
  })
}

// Restore content
export function useRestoreContent(contentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.post<boolean>(endpoints.contentRestore(contentId))
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentKeys.detail(contentId) })
      qc.invalidateQueries({ queryKey: contentKeys.lists() })
    },
  })
}

// Submit content for approval
export function useSubmitContent(contentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<ApprovalResponseDto> => {
      const resp = await api.post<ApprovalResponseDto>(endpoints.contentSubmit(contentId))
      return resp.data
    },
    onMutate: async () => {
      const key = contentKeys.detail(contentId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ContentResponseDto>(key)
      if (prev) {
        qc.setQueryData<ContentResponseDto>(key, { 
          ...prev, 
          status: 'PendingApproval' as any
        })
      }
      return { prev }
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(contentKeys.detail(contentId), ctx.prev)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: contentKeys.detail(contentId) })
      qc.invalidateQueries({ queryKey: contentKeys.lists() })
      // Also invalidate approvals since a new approval was created
      qc.invalidateQueries({ queryKey: ['approvals'] })
    },
  })
}

// Publish content
export function usePublishContent(contentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (integrationId: string): Promise<PublishResultDto> => {
      const resp = await api.post<PublishResultDto>(endpoints.contentPublish(contentId, integrationId))
      return resp.data
    },
    onMutate: async () => {
      const key = contentKeys.detail(contentId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ContentResponseDto>(key)
      if (prev) {
        qc.setQueryData<ContentResponseDto>(key, { 
          ...prev, 
          status: 'Published' as any
        })
      }
      return { prev }
    },
    onError: (_err, _integrationId, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(contentKeys.detail(contentId), ctx.prev)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: contentKeys.detail(contentId) })
      qc.invalidateQueries({ queryKey: contentKeys.lists() })
      // Also invalidate posts since a new post was created
      qc.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}