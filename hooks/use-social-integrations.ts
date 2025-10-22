import { useQuery } from '@tanstack/react-query'
import { api, endpoints } from '@/lib/api'

// Types
export interface SocialIntegrationDto {
  id: string;
  socialAccountId: string;
  profileId: string;
  brandId: string;
  externalId: string;
  name: string;
  platform: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  socialAccountName?: string;
  brandName?: string;
  profileName?: string;
}

// Query Keys
export const socialIntegrationKeys = {
  all: ['social-integrations'] as const,
  lists: () => [...socialIntegrationKeys.all, 'list'] as const,
  byBrand: (brandId: string) => [...socialIntegrationKeys.all, 'brand', brandId] as const,
}

// Get social integrations for a brand
export function useSocialIntegrations(brandId?: string) {
  return useQuery({
    queryKey: brandId ? socialIntegrationKeys.byBrand(brandId) : socialIntegrationKeys.lists(),
    queryFn: async (): Promise<SocialIntegrationDto[]> => {
      if (!brandId) return []
      const resp = await api.get<SocialIntegrationDto[]>(endpoints.socialIntegrationsByBrand(brandId))
      return resp.data
    },
    enabled: !!brandId,
  })
}

// Get all social integrations
export function useAllSocialIntegrations() {
  return useQuery({
    queryKey: socialIntegrationKeys.lists(),
    queryFn: async (): Promise<SocialIntegrationDto[]> => {
      const resp = await api.get<SocialIntegrationDto[]>(endpoints.socialIntegrations())
      return resp.data
    },
  })
}
