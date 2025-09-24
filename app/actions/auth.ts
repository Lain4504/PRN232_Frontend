'use server'

import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode'
import { User } from '@/lib/provider/user-types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

interface TokenPayload {
  exp: number
  sub: string
  roles: string[]
}

export async function setAuthTokens(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  })
  
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  })
}

export async function getAuthTokens() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value
  return { accessToken, refreshToken }
}

export async function clearAuthTokens() {
  const cookieStore = await cookies()
  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
}

export async function logoutUser() {
  try {
    // Get current access token
    const { accessToken } = await getAuthTokens();
    
    if (!accessToken) {
      console.log('No access token found for logout');
      await clearAuthTokens();
      return { success: true };
    }

    // Call the Spring Boot logout API with Authorization header
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    // Clear local tokens
    await clearAuthTokens();
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear local tokens even if the API call fails
    await clearAuthTokens();
    return { success: false, error };
  }
}

export async function refreshAccessToken() {
  const { refreshToken } = await getAuthTokens()
  if (!refreshToken) {
    console.log('No refresh token found')
    return null
  }

  try {
    console.log('Attempting to refresh token...')
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      console.error('Token refresh failed:', {
        status: response.status,
        statusText: response.statusText
      })
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()
    console.log('Token refresh successful')
    await setAuthTokens(data.accessToken, data.refreshToken)
    return data.accessToken
  } catch (error) {
    console.error('Error refreshing token:', error)
    await clearAuthTokens()
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { accessToken: initialToken } = await getAuthTokens()
  if (!initialToken) {
    console.log('No access token found')
    return null
  }

  try {
    let accessToken = initialToken

    // Check if token is about to expire (within 30 seconds)
    const decoded = jwtDecode<TokenPayload>(accessToken)
    const expirationTime = decoded.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    const timeUntilExpiration = expirationTime - currentTime
    
    console.log('Token expiration check:', {
      expirationTime: new Date(expirationTime).toISOString(),
      currentTime: new Date(currentTime).toISOString(),
      timeUntilExpiration: Math.floor(timeUntilExpiration / 1000) + ' seconds',
      isExpiringSoon: timeUntilExpiration < 30 * 1000
    })

    if (timeUntilExpiration < 30 * 1000) {
      console.log('Token is expiring soon, attempting refresh')
      const newToken = await refreshAccessToken()
      if (!newToken) {
        console.log('Failed to refresh token, trying to use current token')
        // Continue with current token if refresh fails
      } else {
        console.log('Successfully refreshed token')
        accessToken = newToken
      }
    }

    console.log('Fetching user profile with token:', accessToken.substring(0, 10) + '...')
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Failed to fetch user:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`Failed to fetch user: ${response.status} ${response.statusText}`)
    }

    const userData = await response.json()
    console.log('User data received:', userData)

    if (!userData || !userData.id || !userData.email || !userData.username) {
      console.error('Invalid user data received:', userData)
      throw new Error('Invalid user data received from server')
    }

    return {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      displayName: userData.displayName ?? null,
      avatarUrl: userData.avatarUrl,
      backgroundUrl: userData.backgroundUrl,
      roles: userData.roles || [],
      isVerified: true,
    }
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

export async function checkAuth() {
  const user = await getCurrentUser()
  if (!user) {
    await clearAuthTokens()
    return null
  }
  return user
}

export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const data = await response.json()
    console.log('Login response:', data)

    if (!data.accessToken || !data.refreshToken) {
      throw new Error('Invalid response: missing tokens')
    }

    await setAuthTokens(data.accessToken, data.refreshToken)

    // For initial login, use the user data from the login response
    // instead of making another API call
    const user = {
      id: data.userId,
      email: data.email,
      username: data.username,
      displayName: data.displayName ?? null,
      avatarUrl: null,
      roles: data.roles || [],
      isVerified: true,
    }

    return { user }
  } catch (error) {
    console.error('Login error:', error)
    await clearAuthTokens()
    throw error
  }
} 