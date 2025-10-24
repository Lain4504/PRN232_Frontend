import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, endpoints } from '@/lib/api'
import type { Profile, CreateProfileForm, User } from '@/lib/types/aisam-types'

// Query Keys
export const profileKeys = {
  all: ['profiles'] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (profileId: string) => [...profileKeys.details(), profileId] as const,
  me: () => [...profileKeys.all, 'me'] as const,
}

// Get current user profile
export function useUserProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: async (): Promise<User> => {
      try {
        const resp = await api.get<User>(endpoints.userProfile)
        return resp.data
      } catch (error) {
        // Fallback for development when backend is not available
        console.warn('Backend not available, using fallback user data')
        return {
          id: 'dev-user-1',
          email: 'dev@example.com',
          first_name: 'Dev',
          last_name: 'User',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as User
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry when backend is not available
  })
}

// Get user's profiles
export function useProfiles(userId?: string) {
  return useQuery({
    queryKey: profileKeys.lists(),
    queryFn: async (): Promise<Profile[]> => {
      if (!userId) {
        console.warn('No userId provided for profiles query')
        return []
      }
      
      try {
        console.log('Fetching profiles for userId:', userId)
        const resp = await api.get<Profile[]>(endpoints.profilesByUser(userId))
        console.log('Profiles API response:', resp)
        return resp.data
      } catch (error) {
        // Fallback for development when backend is not available
        console.warn('Backend not available, using fallback profiles data', error)
        return []
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry when backend is not available
  })
}

// Get profile by ID
export function useProfile(profileId?: string) {
  return useQuery({
    queryKey: profileId ? profileKeys.detail(profileId) : profileKeys.details(),
    queryFn: async (): Promise<Profile> => {
      const resp = await api.get<Profile>(endpoints.profileById(profileId!))
      return resp.data
    },
    enabled: !!profileId,
    retry: (count, err) => {
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) return false
      return count < 2
    },
  })
}

// Create profile
export function useCreateProfile(userId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateProfileForm): Promise<Profile> => {
      const formData = new FormData()
      formData.append('Name', payload.name)
      formData.append('ProfileType', payload.profile_type)
      if (payload.company_name) formData.append('CompanyName', payload.company_name)
      if (payload.bio) formData.append('Bio', payload.bio)
      if (payload.avatar) formData.append('AvatarFile', payload.avatar)
      
      const resp = await api.postMultipart<Profile>(endpoints.profilesByUser(userId!), formData)
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.lists() })
    },
  })
}

// Update profile
export function useUpdateProfile(profileId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateProfileForm): Promise<Profile> => {
      const formData = new FormData()
      formData.append('Name', payload.name)
      formData.append('ProfileType', payload.profile_type)
      if (payload.company_name) formData.append('CompanyName', payload.company_name)
      if (payload.bio) formData.append('Bio', payload.bio)
      if (payload.avatar) formData.append('AvatarFile', payload.avatar)
      
      const resp = await api.putMultipart<Profile>(endpoints.profileById(profileId), formData)
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.detail(profileId) })
      qc.invalidateQueries({ queryKey: profileKeys.lists() })
    },
  })
}

// Delete profile
export function useDeleteProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (profileId: string): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.profileById(profileId))
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.lists() })
    },
  })
}