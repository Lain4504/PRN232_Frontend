import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, endpoints } from '@/lib/api'
import type { Brand, CreateBrandForm } from '@/lib/types/aisam-types'

// Query Keys
export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  details: () => [...brandKeys.all, 'detail'] as const,
  detail: (brandId: string) => [...brandKeys.details(), brandId] as const,
}

// Get all brands
export function useBrands() {
  return useQuery({
    queryKey: brandKeys.lists(),
    queryFn: async (): Promise<Brand[]> => {
      try {
        const resp = await api.get<{ data: { data: Brand[] } }>(endpoints.brands())
        
        // Handle the actual API response format: 
        // { success: true, data: { data: [brands] } }
        
        if (resp.data && resp.data.data && Array.isArray(resp.data.data)) {
          return resp.data.data;
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching brands:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get brands by team ID
export function useBrandsByTeam(teamId?: string) {
  return useQuery({
    queryKey: [...brandKeys.lists(), 'team', teamId],
    queryFn: async (): Promise<Brand[]> => {
      if (!teamId) return [];
      try {
        const resp = await api.get<Brand[]>(endpoints.brandsByTeam(teamId))

        // Handle response format - direct array from API response
        if (resp.data && Array.isArray(resp.data)) {
          return resp.data;
        }

        return [];
      } catch (error) {
        console.error('Error fetching brands by team:', error);
        return [];
      }
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
export function useBrand(brandId?: string) {
  return useQuery({
    queryKey: brandId ? brandKeys.detail(brandId) : brandKeys.details(),
    queryFn: async (): Promise<Brand> => {
      const resp = await api.get<{ data: Brand }>(endpoints.brandById(brandId!))
      return resp.data.data
    },
    enabled: !!brandId,
    retry: (count, err) => {
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) return false
      return count < 2
    },
  })
}

// Create brand
export function useCreateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateBrandForm): Promise<Brand> => {
      // Remove file from payload for now (backend might not support multipart)
      const { logo, ...jsonPayload } = payload
      const resp = await api.post<{ data: Brand }>(endpoints.brands(), jsonPayload)
      return resp.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: brandKeys.lists() })
    },
  })
}

// Update brand
export function useUpdateBrand(brandId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateBrandForm): Promise<Brand> => {
      const resp = await api.put<{ data: Brand }>(endpoints.brandById(brandId), payload)
      return resp.data.data
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: brandKeys.detail(brandId) })
      qc.invalidateQueries({ queryKey: brandKeys.lists() })
    },
  })
}

// Delete brand
export function useDeleteBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (brandId: string): Promise<boolean> => {
      const resp = await api.delete<{ data: boolean }>(endpoints.brandById(brandId))
      return resp.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: brandKeys.lists() })
    },
  })
}