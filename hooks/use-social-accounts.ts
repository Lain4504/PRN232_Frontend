import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, endpoints, PaginatedResponse } from '@/lib/api'
import { 
  SocialAccountDto, 
  SocialTargetDto, 
  AvailableTargetDto,
  SocialAuthUrlResponse,
  SocialCallbackRequest,
  SocialCallbackResponse,
  LinkTargetsRequest,
  LinkTargetsResponse,
  AccountsWithTargetsResponse,
  Brand
} from '@/lib/types/aisam-types'

// Query Keys
export const socialAccountKeys = {
  all: ['social-accounts'] as const,
  lists: () => [...socialAccountKeys.all, 'list'] as const,
  list: (userId?: string) => [...socialAccountKeys.lists(), userId] as const,
  details: () => [...socialAccountKeys.all, 'detail'] as const,
  detail: (id: string) => [...socialAccountKeys.details(), id] as const,
  availableTargets: (id: string) => [...socialAccountKeys.detail(id), 'available-targets'] as const,
  linkedTargets: (id: string) => [...socialAccountKeys.detail(id), 'linked-targets'] as const,
  accountsWithTargets: () => [...socialAccountKeys.all, 'accounts-with-targets'] as const,
}

// Get social accounts for current user
export function useGetSocialAccounts(userId?: string) {
  return useQuery({
    queryKey: socialAccountKeys.list(userId),
    queryFn: async (): Promise<SocialAccountDto[]> => {
      const endpoint = userId 
        ? endpoints.socialAccountsUser(userId)
        : endpoints.socialAccountsMe()
      const response = await api.get<SocialAccountDto[]>(endpoint)
      return response.data
    },
    enabled: !!userId || true, // Always enabled for current user
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error instanceof Error && error.message.includes('401')) {
        return false
      }
      return failureCount < 2
    },
  })
}

// Get social accounts with targets
export function useGetAccountsWithTargets() {
  return useQuery({
    queryKey: socialAccountKeys.accountsWithTargets(),
    queryFn: async (): Promise<AccountsWithTargetsResponse[]> => {
      const response = await api.get<AccountsWithTargetsResponse[]>(endpoints.socialAccountsWithTargets())
      return response.data
    },
  })
}

// Get available targets (fanpages) for a social account
export function useGetAvailableTargets(socialAccountId: string) {
  return useQuery({
    queryKey: socialAccountKeys.availableTargets(socialAccountId),
    queryFn: async (): Promise<AvailableTargetDto[]> => {
      const response = await api.get<{ targets: AvailableTargetDto[] }>(endpoints.availableTargets(socialAccountId))
      return response.data.targets
    },
    enabled: !!socialAccountId,
  })
}

// Get linked targets for a social account
export function useGetLinkedTargets(socialAccountId: string) {
  return useQuery({
    queryKey: socialAccountKeys.linkedTargets(socialAccountId),
    queryFn: async (): Promise<SocialTargetDto[]> => {
      const response = await api.get<SocialTargetDto[]>(endpoints.linkedTargets(socialAccountId))
      return response.data
    },
    enabled: !!socialAccountId,
  })
}

// Get OAuth URL for provider
export function useGetAuthUrl(provider: 'facebook' | 'tiktok' | 'twitter') {
  return useQuery({
    queryKey: ['social-auth', provider, 'url'],
    queryFn: async (): Promise<SocialAuthUrlResponse> => {
      const response = await api.get<SocialAuthUrlResponse>(endpoints.socialAuth(provider))
      return response.data
    },
    enabled: false, // Only fetch when explicitly called
  })
}

// Connect social account (OAuth callback)
export function useConnectSocialAccount() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ provider, data }: { provider: string; data: SocialCallbackRequest }): Promise<SocialCallbackResponse> => {
      const response = await api.post<SocialCallbackResponse>(endpoints.socialCallback(provider), data)
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch social accounts
      queryClient.invalidateQueries({ queryKey: socialAccountKeys.all })
    },
  })
}

// Link targets (fanpages) to brand
export function useLinkTargets() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ socialAccountId, data }: { socialAccountId: string; data: LinkTargetsRequest }): Promise<LinkTargetsResponse> => {
      const response = await api.post<LinkTargetsResponse>(endpoints.linkTargets(socialAccountId), data)
      return response.data
    },
    onSuccess: (_, { socialAccountId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: socialAccountKeys.linkedTargets(socialAccountId) })
      queryClient.invalidateQueries({ queryKey: socialAccountKeys.accountsWithTargets() })
      queryClient.invalidateQueries({ queryKey: socialAccountKeys.detail(socialAccountId) })
    },
  })
}

// Unlink social account
export function useUnlinkAccount() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, socialAccountId }: { userId: string; socialAccountId: string }): Promise<void> => {
      await api.delete(endpoints.socialUnlinkAccount(userId, socialAccountId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialAccountKeys.all })
    },
  })
}

// Unlink target (fanpage) from brand
export function useUnlinkTarget() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, socialIntegrationId }: { userId: string; socialIntegrationId: string }): Promise<void> => {
      await api.delete(endpoints.unlinkTarget(userId, socialIntegrationId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialAccountKeys.all })
    },
  })
}

// Get brands for linking
export function useGetBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async (): Promise<Brand[]> => {
      const response = await api.get<PaginatedResponse<Brand>>(endpoints.brands())
      return response.data.data
    },
  })
}
