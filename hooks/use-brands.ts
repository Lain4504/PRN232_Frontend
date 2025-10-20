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
        const resp = await api.get<any>(endpoints.brands())
        console.log('Brands API response:', resp); // Debug log
        
        // Handle different response formats
        let brandsArray = [];
        if (resp.data) {
          // If it's a paginated response
          if (resp.data.data && Array.isArray(resp.data.data)) {
            brandsArray = resp.data.data;
          }
          // If it's a direct array
          else if (Array.isArray(resp.data)) {
            brandsArray = resp.data;
          }
          // If it's wrapped in another structure
          else if (resp.data.brands && Array.isArray(resp.data.brands)) {
            brandsArray = resp.data.brands;
          }
        }
        
        console.log('Processed brands array:', brandsArray); // Debug log
        return brandsArray;
      } catch (error) {
        console.error('Error fetching brands:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Get brand by ID
export function useBrand(brandId?: string) {
  return useQuery({
    queryKey: brandId ? brandKeys.detail(brandId) : brandKeys.details(),
    queryFn: async (): Promise<Brand> => {
      const resp = await api.get<Brand>(endpoints.brandById(brandId!))
      return resp.data
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
      const resp = await api.post<Brand>(endpoints.brands(), jsonPayload)
      return resp.data
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
      const resp = await api.put<Brand>(endpoints.brandById(brandId), payload)
      return resp.data
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
      const resp = await api.delete<boolean>(endpoints.brandById(brandId))
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: brandKeys.lists() })
    },
  })
}