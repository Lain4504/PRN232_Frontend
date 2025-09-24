"use client"
import { useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store/auth-store'
import { getCurrentUser, refreshAccessToken } from '@/app/actions/auth'
import { jwtDecode } from 'jwt-decode'

interface TokenPayload {
  exp: number
  sub: string
  roles: string[]
}

// Timing constants (in milliseconds)
const TOKEN_LIFETIME = 60 * 60 * 1000 // 3 minutes (Test) | 60 * 60 * 1000 // 60 minutes (Production)
const REFRESH_THRESHOLD = 5 * 60 * 1000 // 45 seconds (Test) | 5 * 60 * 1000 // 5 minutes (Production)
const MIN_REFRESH_INTERVAL = 10 * 60 * 1000 // 1 minute (Test) | 10 * 60 * 1000 // 10 minutes (Production)
const CHECK_INTERVAL = 2 * 60 * 1000 // 10 seconds (Test) | 2 * 60 * 1000 // 2 minutes (Production)

// Request queue to manage concurrent API calls
class RequestQueue {
  private queue: Map<string, Promise<unknown>> = new Map()
  private lastRefreshTime: number = 0

  async enqueue<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // If there's already a request in progress, return its promise
    if (this.queue.has(key)) {
      return this.queue.get(key) as Promise<T>
    }

    // Create new request
    const promise = fn().finally(() => {
      this.queue.delete(key)
    })

    // Store the promise
    this.queue.set(key, promise)
    return promise
  }

  canRefresh(): boolean {
    const now = Date.now()
    const timeSinceLastRefresh = now - this.lastRefreshTime
    const canRefresh = timeSinceLastRefresh >= MIN_REFRESH_INTERVAL
    
    if (canRefresh) {
      this.lastRefreshTime = now
    }
    
    return canRefresh
  }
}

// Create a singleton instance
const requestQueue = new RequestQueue()

export function useAuth() {
  const { user, setUser, clearUser } = useAuthStore()

  const fetchUser = useCallback(async () => {
    return requestQueue.enqueue('fetchUser', async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          setUser(user)
        } else {
          clearUser()
        }
        return user
      } catch (error) {
        console.error('Error fetching user:', error)
        clearUser()
        return null
      }
    })
  }, [setUser, clearUser])

  // Function to check and refresh token
  const checkAndRefreshToken = useCallback(async () => {
    return requestQueue.enqueue('checkToken', async () => {
      try {
        const response = await fetch('/api/auth/check-token')
        const { accessToken } = await response.json()
        
        if (accessToken) {
          const decoded = jwtDecode<TokenPayload>(accessToken)
          const expirationTime = decoded.exp * 1000 // Convert to milliseconds
          const currentTime = Date.now()
          const timeUntilExpiration = expirationTime - currentTime

          // Check if we can refresh the token
          if (timeUntilExpiration < REFRESH_THRESHOLD && requestQueue.canRefresh()) {
            console.log('Token will expire soon, refreshing...', {
              timeUntilExpiration: Math.floor(timeUntilExpiration / 1000) + ' seconds',
              tokenLifetime: Math.floor(TOKEN_LIFETIME / 1000) + ' seconds'
            })
            
            await refreshAccessToken()
            // Fetch user data after successful refresh
            await fetchUser()
          }
        }
      } catch (error) {
        console.error('Error checking token:', error)
      }
    })
  }, [fetchUser])

  useEffect(() => {
    // Initial user fetch
    fetchUser()

    // Set up interval to check token
    const intervalId = setInterval(checkAndRefreshToken, CHECK_INTERVAL)

    return () => {
      clearInterval(intervalId)
    }
  }, [fetchUser, checkAndRefreshToken])

  return {
    user,
    isAuthenticated: !!user,
  }
} 