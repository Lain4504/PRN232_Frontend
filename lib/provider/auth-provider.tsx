'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from "@/lib/store/auth-store"
import { getCurrentUser } from "@/app/actions/auth"
import { SocialAccount, SocialAccountsResponse } from '@/lib/provider/social-types'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsAuthenticated, isAuthenticated, updateUserSocialAccounts } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Only fetch user if not already authenticated or user data is missing
        if (!isAuthenticated || !useAuthStore.getState().user) {
          const user = await getCurrentUser()
          if (user) {
            setUser(user)
            setIsAuthenticated(true)
            
            // Load social accounts for the user
            try {
              const response = await fetch(`/api/social/accounts/user/${user.id}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              })

              if (response.ok) {
                const data: SocialAccountsResponse = await response.json()
                if (data.success) {
                  updateUserSocialAccounts(data.data)
                }
              }
            } catch (error) {
              console.error('Error loading social accounts:', error)
              // Don't fail the entire auth process if social accounts fail to load
            }
          } else {
            setUser(null)
            setIsAuthenticated(false)
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [setUser, setIsAuthenticated, isAuthenticated, updateUserSocialAccounts])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return children
} 