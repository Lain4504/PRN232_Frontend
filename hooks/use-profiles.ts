import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, endpoints } from '@/lib/api'
import { Profile, CreateProfileForm } from '@/lib/types/aisam-types'

export const profileKeys = {
  all: ['profiles'] as const,
  lists: () => [...profileKeys.all, 'list'] as const,
  list: (userId: string, search?: string, isDeleted?: boolean) => [...profileKeys.lists(), { userId, search: search ?? '', isDeleted: isDeleted ?? false }] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (id: string) => [...profileKeys.details(), id] as const,
}

export function useGetProfiles(userId: string, search?: string, isDeleted?: boolean) {
  return useQuery({
    queryKey: profileKeys.list(userId, search, isDeleted),
    queryFn: async (): Promise<Profile[]> => {
      try {
        const res = await api.get<Profile[]>(endpoints.profilesByUser(userId, search, isDeleted))
        return res.data || []
      } catch (error) {
        console.error('Error fetching profiles:', error)
        return []
      }
    },
    enabled: !!userId,
  })
}

export function useGetProfile(id: string) {
  return useQuery({
    queryKey: profileKeys.detail(id),
    queryFn: async (): Promise<Profile | null> => {
      try {
        const res = await api.get<Profile>(endpoints.profileById(id))
        return res.data || null
      } catch (error) {
        console.error('Error fetching profile:', error)
        return null
      }
    },
    enabled: !!id,
  })
}

export function useCreateProfile(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateProfileForm): Promise<Profile> => {
      const fd = new FormData()
      fd.append('Name', data.name)
      fd.append('ProfileType', data.profile_type === 'business' ? '1' : '0')
      if (data.company_name) fd.append('CompanyName', data.company_name)
      if (data.bio) fd.append('Bio', data.bio)
      if (data.avatar) fd.append('AvatarFile', data.avatar)
      if (data.avatarUrl) fd.append('AvatarUrl', data.avatarUrl)
      const res = await api.postForm<Profile>(endpoints.createProfile(userId), fd)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.lists() })
    },
  })
}

export function useUpdateProfile(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<CreateProfileForm>): Promise<Profile> => {
      const fd = new FormData()
      if (data.profile_type) fd.append('ProfileType', data.profile_type === 'business' ? '1' : '0')
      if (data.company_name !== undefined) fd.append('CompanyName', data.company_name ?? '')
      if (data.bio !== undefined) fd.append('Bio', data.bio ?? '')
      if (data.avatar) fd.append('AvatarFile', data.avatar)
      if (data.avatarUrl !== undefined) fd.append('AvatarUrl', data.avatarUrl ?? '')
      const res = await api.putForm<Profile>(endpoints.updateProfile(id), fd)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.detail(id) })
      qc.invalidateQueries({ queryKey: profileKeys.lists() })
    },
  })
}

export function useDeleteProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<boolean> => {
      const res = await api.delete<boolean>(endpoints.deleteProfile(id))
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.lists() })
    },
  })
}

export function useRestoreProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string): Promise<boolean> => {
      const res = await api.patch<boolean>(endpoints.restoreProfile(id))
      return res.data
    },
    onSuccess: (data, id) => {
      qc.invalidateQueries({ queryKey: profileKeys.detail(id) })
      qc.invalidateQueries({ queryKey: profileKeys.lists() })
    },
  })
}


