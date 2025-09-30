import { createClient } from '@/lib/supabase/client'

// Types
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  error?: string
}

// Environment
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

// Auth fetch helper
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  
  return fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  })
}

// API methods
export const api = {
  // GET
  get: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  // POST
  post: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  // PUT
  put: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  // DELETE
  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, { method: 'DELETE' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },
}

// Endpoints
export const endpoints = {
  userProfile: () => '/users/profile/me',
  socialAccounts: (userId: string) => `/social/accounts/user/${userId}`,
  socialUnlink: (userId: string, socialAccountId: string) => `/social-auth/unlink/${userId}/${socialAccountId}`,
  facebookAuth: () => '/social-auth/facebook',
  facebookCallback: (code: string, userId: string, state?: string) => 
    `/social-auth/facebook/callback?code=${code}&userId=${userId}${state ? `&state=${state}` : ''}`,
  availableTargets: (provider: string) => `/social-auth/${provider}/available-targets`,
  linkSelectedTargets: () => '/social-auth/link-selected',
  createPost: () => '/content',
}
