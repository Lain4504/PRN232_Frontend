"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getActiveTeamId, setActiveTeamId, clearActiveTeamId } from '@/lib/utils/profile-utils'
import { api } from '@/lib/api'
import { useUser } from '@/hooks/use-user'
import { hasPermission as checkPermission } from '@/lib/utils/team-permissions'

interface Team {
  id: string
  name: string
  description?: string
  role: string
  permissions: string[]
  membersCount: number
  status: string
}

interface TeamMember {
  id: string
  userId: string
  teamId: string
  role: string
  permissions: string[]
  isActive: boolean
  userEmail: string
}

interface TeamContextType {
  activeTeamId: string | null
  activeTeam: Team | null
  currentMember: TeamMember | null
  isLoading: boolean
  setActiveTeam: (teamId: string, team: Team) => void
  clearActiveTeam: () => void
  hasPermission: (permission: string) => boolean
  refreshTeam: () => Promise<void>
  loadTeamData: (teamId: string) => Promise<void>
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

interface TeamProviderProps {
  children: ReactNode
}

export function TeamProvider({ children }: TeamProviderProps) {
  const [activeTeamId, setActiveTeamIdState] = useState<string | null>(null)
  const [activeTeam, setActiveTeamState] = useState<Team | null>(null)
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { data: user } = useUser()

  // Load team context from localStorage on mount
  useEffect(() => {
    const loadTeamContext = async () => {
      try {
        const savedTeamId = getActiveTeamId()
        
        if (savedTeamId) {
          setActiveTeamIdState(savedTeamId)
          await loadTeamData(savedTeamId)
        }
      } catch (error) {
        console.error('Error loading team context:', error)
        clearActiveTeamId()
      } finally {
        setIsLoading(false)
      }
    }

    loadTeamContext()
  }, [user?.id])

  const loadTeamData = async (teamId: string): Promise<void> => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      
      // Fetch team details
      const teamResponse = await api.get(`/team/${teamId}`)
      const teamData = teamResponse.data
      
      // Fetch current user's membership in this team
      const membersResponse = await api.get(`/team/${teamId}/members`)
      const members = membersResponse.data
      const currentUserMember = members.find((member: TeamMember) => member.userId === user.id)
      
      if (!currentUserMember) {
        throw new Error('User is not a member of this team')
      }

      // Get permissions based on role
      const rolePermissions = checkPermission(currentUserMember.role, '') ? 
        [] : // This will be handled by the permission check function
        [] // Default empty array

      const team: Team = {
        id: teamData.id,
        name: teamData.name,
        description: teamData.description,
        role: currentUserMember.role,
        permissions: rolePermissions,
        membersCount: teamData.membersCount || members.length,
        status: teamData.status || 'Active'
      }

      setActiveTeamState(team)
      setCurrentMember(currentUserMember)
      
    } catch (error) {
      console.error('Error loading team data:', error)
      // Clear team context on error
      setActiveTeamIdState(null)
      setActiveTeamState(null)
      setCurrentMember(null)
      clearActiveTeamId()
    } finally {
      setIsLoading(false)
    }
  }

  const setActiveTeam = (teamId: string, team: Team) => {
    setActiveTeamIdState(teamId)
    setActiveTeamState(team)
    
    // Persist to localStorage
    setActiveTeamId(teamId)
  }

  const clearActiveTeam = () => {
    setActiveTeamIdState(null)
    setActiveTeamState(null)
    setCurrentMember(null)
    
    // Clear localStorage
    clearActiveTeamId()
  }

  const hasPermission = (permission: string): boolean => {
    if (!currentMember) return false
    return checkPermission(currentMember.role, permission)
  }

  const refreshTeam = async (): Promise<void> => {
    if (!activeTeamId) return
    await loadTeamData(activeTeamId)
  }

  const value: TeamContextType = {
    activeTeamId,
    activeTeam,
    currentMember,
    isLoading,
    setActiveTeam,
    clearActiveTeam,
    hasPermission,
    refreshTeam,
    loadTeamData
  }

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (!context) {
    throw new Error('useTeam must be used within TeamProvider')
  }
  return context
}

// Hook for checking team permissions
export function useTeamPermission(permission: string) {
  const { hasPermission } = useTeam()
  return hasPermission(permission)
}
