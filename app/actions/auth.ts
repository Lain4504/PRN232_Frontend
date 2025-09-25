'use server'

import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode'
import { User } from '@/lib/provider/user-types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5283/api'

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
    // Get current tokens
    const { accessToken, refreshToken } = await getAuthTokens();
    
    if (!accessToken) {
      console.log('No access token found for logout');
      await clearAuthTokens();
      return { success: true };
    }

    // Call the Spring Boot logout API with Authorization header and refresh token
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ 
        refreshToken: refreshToken || 'string' 
      }),
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
  const { accessToken, refreshToken } = await getAuthTokens()
  if (!refreshToken) {
    console.log('No refresh token found')
    return null
  }

  try {
    console.log('Attempting to refresh token...')
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
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
    
    // Handle the new response format
    if (data.success && data.data) {
      await setAuthTokens(data.data.accessToken, data.data.refreshToken)
      return data.data.accessToken
    } else {
      throw new Error('Invalid refresh response format')
    }
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

    const responseData = await response.json()
    console.log('User data received:', responseData)

    // Extract user data from the nested structure
    const userData = responseData.data
    if (!userData || !userData.id || !userData.email) {
      console.error('Invalid user data received:', responseData)
      throw new Error('Invalid user data received from server')
    }
      
    return {
      id: userData.id,
      email: userData.email,
      username: userData.email, // Using email as username since it's not provided by API
      displayName: userData.displayName ?? null,
      avatarUrl: userData.avatarUrl ?? null,
      backgroundUrl: userData.backgroundUrl ?? null,
      roles: userData.roles || ['user'], // Default role since it's not provided in the response
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
    console.log('Attempting to url:', `${API_URL}/auth/login`);
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

    if (!data.data?.accessToken || !data.data?.refreshToken) {
      throw new Error('Invalid response: missing tokens')
    }

    await setAuthTokens(data.data.accessToken, data.data.refreshToken)

    // Use the user data from the login response
    const user = {
      id: data.data.user.id,
      email: data.data.user.email,
      username: data.data.user.email, // Using email as username since it's not provided
      displayName: null,
      avatarUrl: null,
      roles: ['user'], // Default role since it's not provided in the response
      isVerified: true,
    }

    return { user }
  } catch (error) {
    console.error('Login error:', error)
    await clearAuthTokens()
    throw error
  }
} 