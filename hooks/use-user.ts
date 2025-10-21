import { useQuery } from '@tanstack/react-query'
import { api, endpoints } from '@/lib/api'
import type { UserResponseDto } from '@/lib/types/user'

// Query Keys
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
}

// Get current user profile
export function useUser() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: async (): Promise<UserResponseDto> => {
      const response = await api.get<UserResponseDto>(endpoints.userProfile)
      return response.data
    },
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        return false
      }
      return failureCount < 2
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
