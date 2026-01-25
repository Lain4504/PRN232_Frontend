"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import { ProfileTypeEnum, getActiveProfileId, setActiveProfileId, clearActiveProfileId, getProfileType, setProfileType, clearProfileType, checkFeatureAccess, clearProfileContext } from '@/lib/utils/profile-utils'
import { useAuth } from '@/lib/contexts/auth-context'

import { api, endpoints } from '@/lib/api'

interface Profile {
  id: string
  name: string
  type: ProfileTypeEnum
  avatarUrl?: string
  companyName?: string
  isOwner: boolean
  memberRole?: string
}

interface ProfileApiResponse {
  id: string
  name?: string
  company_name?: string
  profileType?: ProfileTypeEnum
  avatarUrl?: string
  companyName?: string
  isOwner?: boolean
  memberRole?: string
}

interface ApiResponse {
  data?: ProfileApiResponse
}

interface ProfileContextType {
  activeProfileId: string | null
  activeProfile: Profile | null
  allProfiles: Profile[]
  profileType: ProfileTypeEnum
  isLoading: boolean
  setActiveProfile: (profileId: string, profile: Profile) => void
  clearActiveProfile: () => void
  hasFeatureAccess: (feature: string) => boolean
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

interface ProfileProviderProps {
  children: ReactNode
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { session, isLoading: isAuthLoading } = useAuth()
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null)
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null)
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [profileType, setProfileTypeState] = useState<ProfileTypeEnum>(ProfileTypeEnum.Free)
  const [isLoading, setIsLoading] = useState(true)

  // Load profile context from localStorage on mount and hydrate from API
  useEffect(() => {
    let cancelled = false

    const loadProfileContext = async () => {
      // Wait for auth to initialize
      if (isAuthLoading) return

      // If not authenticated, clear profile and return
      if (!session) {
        if (!cancelled) {
          setActiveProfileIdState(null)
          setActiveProfileState(null)
          setAllProfiles([])
          setProfileTypeState(ProfileTypeEnum.Free)
          setIsLoading(false)
        }
        return
      }

      try {
        // Fetch all profiles for the user
        const profilesResponse = await api.get<ProfileApiResponse[]>(endpoints.profilesByUser(session.user.id))
        const profilesData = profilesResponse.data || []

        const mappedProfiles: Profile[] = profilesData.map(p => ({
          id: p.id,
          name: p.name || p.company_name || 'Profile',
          type: (typeof p.profileType !== 'undefined' ? p.profileType : ProfileTypeEnum.Free) as ProfileTypeEnum,
          avatarUrl: p.avatarUrl,
          companyName: p.company_name || p.companyName,
          isOwner: p.isOwner ?? false,
          memberRole: p.memberRole
        }))

        if (!cancelled) {
          setAllProfiles(mappedProfiles)
        }

        const savedProfileId = getActiveProfileId()
        let profileToSelect: Profile | null = null

        if (savedProfileId) {
          profileToSelect = mappedProfiles.find(p => p.id === savedProfileId) || null
        }

        // Auto-select if only one profile exists
        if (!profileToSelect && mappedProfiles.length === 1) {
          profileToSelect = mappedProfiles[0]
        }

        if (profileToSelect && !cancelled) {
          setActiveProfileIdState(profileToSelect.id)
          setActiveProfileState(profileToSelect)
          setProfileTypeState(profileToSelect.type)
          setActiveProfileId(profileToSelect.id)
          setProfileType(profileToSelect.type)
        }
      } catch (error) {
        console.error('Error loading profile context:', error)
        clearProfileContext()
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadProfileContext()
    return () => { cancelled = true }
  }, [session, isAuthLoading])

  const setActiveProfile = useCallback((profileId: string, profile: Profile) => {
    setActiveProfileIdState(profileId)
    setActiveProfileState(profile)
    setProfileTypeState(profile.type)

    // Persist to localStorage
    setActiveProfileId(profileId)
    setProfileType(profile.type)
  }, [])

  const clearActiveProfile = useCallback(() => {
    setActiveProfileIdState(null)
    setActiveProfileState(null)
    setProfileTypeState(ProfileTypeEnum.Free)

    // Clear localStorage
    clearActiveProfileId()
    clearProfileType()
  }, [])

  const hasFeatureAccess = useCallback((feature: string): boolean => {
    return checkFeatureAccess(profileType, feature)
  }, [profileType])

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!activeProfileId) return
    try {
      setIsLoading(true)
      const response = await api.get<ApiResponse | ProfileApiResponse>(endpoints.profileById(activeProfileId))
      const p = (response.data as ApiResponse)?.data ?? (response.data as ProfileApiResponse)
      if (p) {
        const hydrated: Profile = {
          id: p.id ?? activeProfileId,
          name: p.name || p.company_name || 'Profile',
          type: (typeof p.profileType !== 'undefined' ? p.profileType : profileType) as ProfileTypeEnum,
          avatarUrl: p.avatarUrl,
          companyName: p.company_name || p.companyName,
          isOwner: p.isOwner ?? (activeProfile?.isOwner ?? false),
          memberRole: p.memberRole ?? activeProfile?.memberRole
        }
        setActiveProfileState(hydrated)
        setProfileTypeState(hydrated.type)
        setProfileType(hydrated.type)
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    } finally {
      setIsLoading(false)
    }
  }, [activeProfileId, profileType, activeProfile])

  const value: ProfileContextType = useMemo(() => ({
    activeProfileId,
    activeProfile,
    allProfiles,
    profileType,
    isLoading,
    setActiveProfile,
    clearActiveProfile,
    hasFeatureAccess,
    refreshProfile
  }), [
    activeProfileId,
    activeProfile,
    allProfiles,
    profileType,
    isLoading,
    setActiveProfile,
    clearActiveProfile,
    hasFeatureAccess,
    refreshProfile
  ])

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider')
  }
  return context
}

// Hook for checking feature access
export function useFeatureAccess(feature: string) {
  const { hasFeatureAccess } = useProfile()
  return hasFeatureAccess(feature)
}
