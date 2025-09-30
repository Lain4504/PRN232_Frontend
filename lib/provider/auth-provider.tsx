'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from "@/lib/store/auth-store"
import { createClient } from "@/lib/supabase/client"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const supabaseUser = session.user
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email!,
            username: supabaseUser.email || '',
            displayName: supabaseUser.user_metadata?.display_name || null,
            avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
            backgroundUrl: supabaseUser.user_metadata?.background_url || null,
            roles: supabaseUser.user_metadata?.roles || ['user'],
            isVerified: supabaseUser.email_confirmed_at != null,
          })
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (session?.user) {
          const supabaseUser = session.user
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email!,
            username: supabaseUser.email || '',
            displayName: supabaseUser.user_metadata?.display_name || null,
            avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
            backgroundUrl: supabaseUser.user_metadata?.background_url || null,
            roles: supabaseUser.user_metadata?.roles || ['user'],
            isVerified: supabaseUser.email_confirmed_at != null,
          })
          setIsAuthenticated(true)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setIsAuthenticated, supabase])

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