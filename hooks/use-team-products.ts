import { useQuery } from '@tanstack/react-query'
import { api, endpoints, PaginatedResponse } from '@/lib/api'
import type { Product, Brand } from '@/lib/types/omniadly-types'

// Query Keys
export const teamProductKeys = {
  all: ['team-products'] as const,
  lists: () => [...teamProductKeys.all, 'list'] as const,
  byTeam: (teamId: string) => [...teamProductKeys.all, 'team', teamId] as const,
}

// Get products for team brands
export function useTeamProducts(teamId?: string, brandId?: string) {
  return useQuery({
    queryKey: teamId ? [...teamProductKeys.byTeam(teamId), brandId || 'all'] : teamProductKeys.lists(),
    queryFn: async (): Promise<Product[]> => {
      if (!teamId) return []

      // If specific brandId is provided, use it directly
      if (brandId) {
        const resp = await api.get<PaginatedResponse<Product>>(`${endpoints.products()}?brandId=${brandId}`)
        return resp.data.data || []
      }

      // Otherwise, get all team brands
      const brandsResp = await api.get<Brand[]>(`/brands/team/${teamId}`)
      const brandIds = brandsResp.data.map(brand => brand.id)

      if (brandIds.length === 0) {
        return []
      }

      // Get products for all team brands
      const brandIdParams = brandIds.map(id => `brandId=${id}`).join('&')
      const url = `${endpoints.products()}?${brandIdParams}`

      const resp = await api.get<PaginatedResponse<Product>>(url)
      return resp.data.data || []
    },
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

