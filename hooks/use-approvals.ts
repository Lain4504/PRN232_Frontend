import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, endpoints, PaginatedResponse } from '@/lib/api'
import type {
  ApprovalResponseDto,
  CreateApprovalRequest,
  UpdateApprovalRequest,
  ApprovalFilters,
} from '@/lib/types/aisam-types'
import { ContentStatusEnum } from '@/lib/types/aisam-types'

// Query Keys
export const approvalKeys = {
  all: ['approvals'] as const,
  lists: () => [...approvalKeys.all, 'list'] as const,
  pending: () => [...approvalKeys.all, 'pending'] as const,
  pendingCount: () => [...approvalKeys.all, 'pending', 'count'] as const,
  details: () => [...approvalKeys.all, 'detail'] as const,
  detail: (approvalId: string) => [...approvalKeys.details(), approvalId] as const,
  byContent: (contentId: string) => [...approvalKeys.all, 'content', contentId] as const,
  byApprover: (approverId: string) => [...approvalKeys.all, 'approver', approverId] as const,
  contentPending: (contentId: string) => [...approvalKeys.all, 'content-pending', contentId] as const,
}

// Get pending approvals
export function usePendingApprovals(page = 1, pageSize = 10) {
  return useQuery({
    queryKey: [...approvalKeys.pending(), page, pageSize],
    queryFn: async (): Promise<PaginatedResponse<ApprovalResponseDto>> => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      })
      const resp = await api.get<PaginatedResponse<ApprovalResponseDto>>(
        `${endpoints.approvalsPending()}?${params}`
      )
      return resp.data
    },
  })
}

// Get pending approvals count
export function usePendingApprovalsCount() {
  return useQuery({
    queryKey: approvalKeys.pendingCount(),
    queryFn: async (): Promise<number> => {
      const resp = await api.get<{ data: number }>(`/approvals/pending/count`)
      return resp.data?.data ?? 0
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// Get approvals with filters
export function useApprovals(filters?: ApprovalFilters) {
  const params = new URLSearchParams()
  if (filters?.page) params.set('page', filters.page.toString())
  if (filters?.pageSize) params.set('pageSize', filters.pageSize.toString())
  if (filters?.searchTerm) params.set('searchTerm', filters.searchTerm)
  if (filters?.sortBy) params.set('sortBy', filters.sortBy)
  if (filters?.sortDescending !== undefined) params.set('sortDescending', filters.sortDescending.toString())
  if (filters?.status) params.set('status', filters.status)
  if (filters?.contentId) params.set('contentId', filters.contentId)
  if (filters?.approverId) params.set('approverId', filters.approverId)
  if (filters?.onlyDeleted !== undefined) params.set('onlyDeleted', filters.onlyDeleted.toString())

  const queryString = params.toString()

  return useQuery({
    queryKey: [...approvalKeys.lists(), queryString],
    queryFn: async (): Promise<PaginatedResponse<ApprovalResponseDto>> => {
      const url = queryString ? `${endpoints.approvals()}?${queryString}` : endpoints.approvals()
      const resp = await api.get<PaginatedResponse<ApprovalResponseDto>>(url)
      return resp.data
    },
  })
}

// Get approval by ID
export function useApproval(approvalId?: string) {
  return useQuery({
    queryKey: approvalId ? approvalKeys.detail(approvalId) : approvalKeys.details(),
    queryFn: async (): Promise<ApprovalResponseDto> => {
      const resp = await api.get<ApprovalResponseDto>(endpoints.approvalById(approvalId!))
      return resp.data
    },
    enabled: !!approvalId,
    retry: (count, err) => {
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) return false
      return count < 2
    },
  })
}

// Get approvals by content ID
export function useApprovalsByContent(contentId?: string) {
  return useQuery({
    queryKey: contentId ? approvalKeys.byContent(contentId) : approvalKeys.lists(),
    queryFn: async (): Promise<ApprovalResponseDto[]> => {
      const resp = await api.get<ApprovalResponseDto[]>(endpoints.approvalsByContent(contentId!))
      return resp.data
    },
    enabled: !!contentId,
  })
}

// Get approvals by approver ID
export function useApprovalsByApprover(approverId?: string) {
  return useQuery({
    queryKey: approverId ? approvalKeys.byApprover(approverId) : approvalKeys.lists(),
    queryFn: async (): Promise<ApprovalResponseDto[]> => {
      const resp = await api.get<ApprovalResponseDto[]>(endpoints.approvalsByApprover(approverId!))
      return resp.data
    },
    enabled: !!approverId,
  })
}

// Check if content has pending approvals
export function useContentPendingApprovals(contentId?: string) {
  return useQuery({
    queryKey: contentId ? approvalKeys.contentPending(contentId) : approvalKeys.lists(),
    queryFn: async (): Promise<boolean> => {
      const resp = await api.get<boolean>(endpoints.approvalContentPending(contentId!))
      return resp.data
    },
    enabled: !!contentId,
  })
}

// Create approval
export function useCreateApproval() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateApprovalRequest): Promise<ApprovalResponseDto> => {
      const resp = await api.post<ApprovalResponseDto>(endpoints.approvals(), payload)
      return resp.data
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: approvalKeys.lists() })
      qc.invalidateQueries({ queryKey: approvalKeys.pending() })
      if (created.contentId) {
        qc.invalidateQueries({ queryKey: approvalKeys.byContent(created.contentId) })
        qc.invalidateQueries({ queryKey: approvalKeys.contentPending(created.contentId) })
      }
      if (created.approverId) {
        qc.invalidateQueries({ queryKey: approvalKeys.byApprover(created.approverId) })
      }
    },
  })
}

// Update approval
export function useUpdateApproval(approvalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateApprovalRequest): Promise<ApprovalResponseDto> => {
      const resp = await api.put<ApprovalResponseDto>(endpoints.approvalById(approvalId), payload)
      return resp.data
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: approvalKeys.detail(approvalId) })
      qc.invalidateQueries({ queryKey: approvalKeys.lists() })
      qc.invalidateQueries({ queryKey: approvalKeys.pending() })
      if (updated.contentId) {
        qc.invalidateQueries({ queryKey: approvalKeys.byContent(updated.contentId) })
        qc.invalidateQueries({ queryKey: approvalKeys.contentPending(updated.contentId) })
      }
      if (updated.approverId) {
        qc.invalidateQueries({ queryKey: approvalKeys.byApprover(updated.approverId) })
      }
    },
  })
}

// Delete approval (soft delete)
export function useDeleteApproval(approvalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.approvalById(approvalId))
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalKeys.detail(approvalId) })
      qc.invalidateQueries({ queryKey: approvalKeys.lists() })
      qc.invalidateQueries({ queryKey: approvalKeys.pending() })
    },
  })
}

// Approve an approval
export function useApproveApproval(approvalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (notes?: string): Promise<ApprovalResponseDto> => {
      const resp = await api.post<ApprovalResponseDto>(endpoints.approvalApprove(approvalId), notes || '')
      return resp.data
    },
    onMutate: async (notes) => {
      const key = approvalKeys.detail(approvalId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ApprovalResponseDto>(key)
      if (prev) {
        qc.setQueryData<ApprovalResponseDto>(key, { 
          ...prev, 
          status: ContentStatusEnum.Approved,
          notes: notes || prev.notes
        })
      }
      return { prev }
    },
    onError: (_err, _notes, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(approvalKeys.detail(approvalId), ctx.prev)
      }
    },
    onSettled: (updated) => {
      qc.invalidateQueries({ queryKey: approvalKeys.detail(approvalId) })
      qc.invalidateQueries({ queryKey: approvalKeys.lists() })
      qc.invalidateQueries({ queryKey: approvalKeys.pending() })
      if (updated?.contentId) {
        qc.invalidateQueries({ queryKey: approvalKeys.byContent(updated.contentId) })
        qc.invalidateQueries({ queryKey: approvalKeys.contentPending(updated.contentId) })
        // Invalidate content queries to refresh content status
        qc.invalidateQueries({ queryKey: ['contents'] })
        qc.invalidateQueries({ queryKey: ['team-contents'] })
      }
      if (updated?.approverId) {
        qc.invalidateQueries({ queryKey: approvalKeys.byApprover(updated.approverId) })
      }
    },
  })
}

// Reject an approval
export function useRejectApproval(approvalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (notes?: string): Promise<ApprovalResponseDto> => {
      const resp = await api.post<ApprovalResponseDto>(endpoints.approvalReject(approvalId), notes || '')
      return resp.data
    },
    onMutate: async (notes) => {
      const key = approvalKeys.detail(approvalId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ApprovalResponseDto>(key)
      if (prev) {
        qc.setQueryData<ApprovalResponseDto>(key, { 
          ...prev, 
          status: ContentStatusEnum.Rejected,
          notes: notes || prev.notes
        })
      }
      return { prev }
    },
    onError: (_err, _notes, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(approvalKeys.detail(approvalId), ctx.prev)
      }
    },
    onSettled: (updated) => {
      qc.invalidateQueries({ queryKey: approvalKeys.detail(approvalId) })
      qc.invalidateQueries({ queryKey: approvalKeys.lists() })
      qc.invalidateQueries({ queryKey: approvalKeys.pending() })
      if (updated?.contentId) {
        qc.invalidateQueries({ queryKey: approvalKeys.byContent(updated.contentId) })
        qc.invalidateQueries({ queryKey: approvalKeys.contentPending(updated.contentId) })
        // Invalidate content queries to refresh content status
        qc.invalidateQueries({ queryKey: ['contents'] })
        qc.invalidateQueries({ queryKey: ['team-contents'] })
      }
      if (updated?.approverId) {
        qc.invalidateQueries({ queryKey: approvalKeys.byApprover(updated.approverId) })
      }
    },
  })
}

// Restore approval
export function useRestoreApproval(approvalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.post<boolean>(endpoints.approvalRestore(approvalId))
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalKeys.detail(approvalId) })
      qc.invalidateQueries({ queryKey: approvalKeys.lists() })
      qc.invalidateQueries({ queryKey: approvalKeys.pending() })
    },
  })
}

// Delete approval with confirmation
export function useDeleteApprovalWithConfirm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (approvalId: string): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.approvalById(approvalId))
      return resp.data
    },
    onSuccess: (_, approvalId) => {
      qc.invalidateQueries({ queryKey: approvalKeys.detail(approvalId) })
      qc.invalidateQueries({ queryKey: approvalKeys.lists() })
      qc.invalidateQueries({ queryKey: approvalKeys.pending() })
    },
  })
}