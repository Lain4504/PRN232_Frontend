"use client"
import { useEffect, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { SocialAccount } from '@/lib/provider/social-types'

export interface User {
  id: string
  email: string
  username?: string
  displayName?: string | null
  avatarUrl?: string | null
  backgroundUrl?: string | null
  roles?: string[]
  isVerified?: boolean
  socialAccounts?: SocialAccount[]
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const supabaseUser = session.user
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
          username: supabaseUser.email,
          displayName: supabaseUser.user_metadata?.display_name || null,
          avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
          backgroundUrl: supabaseUser.user_metadata?.background_url || null,
          roles: supabaseUser.user_metadata?.roles || ['user'],
          isVerified: supabaseUser.email_confirmed_at != null,
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    // Initial fetch
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
            username: supabaseUser.email,
            displayName: supabaseUser.user_metadata?.display_name || null,
            avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
            backgroundUrl: supabaseUser.user_metadata?.background_url || null,
            roles: supabaseUser.user_metadata?.roles || ['user'],
            isVerified: supabaseUser.email_confirmed_at != null,
          })
        } else {
          setUser(null)
        }
        
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUser, supabase])

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    refetch: fetchUser,
  }
}
