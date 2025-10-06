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

// Options for API methods
export interface ApiRequestOptions {
  requireAuth?: boolean // default: true
  headers?: Record<string, string>
}

// Auth fetch helper
async function fetchWithAuth(url: string, options: RequestInit = {}, reqOptions: ApiRequestOptions = {}) {
  const { requireAuth = true } = reqOptions

  const authHeader: Record<string, string> = {}
  if (requireAuth) {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      authHeader['Authorization'] = `Bearer ${session.access_token}`
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
    ...(reqOptions.headers || {}),
    ...authHeader,
  }

  return fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  })
}

// API methods
export const api = {
  // GET
  get: async <T>(url: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {}, options)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  // POST
  post: async <T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, options)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  // PUT
  put: async <T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, options)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  // DELETE
  delete: async <T>(url: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, { method: 'DELETE' }, options)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },
}

// Endpoints
export const endpoints = {
  userProfile: () => '/users/profile/me',
  socialAccounts: (userId: string) => `/social/accounts/user/${userId}`,
  socialUnlink: (userId: string, socialAccountId: string) => `/social-auth/unlink/${userId}/${socialAccountId}`,
  // Generic social auth endpoints
  socialAuth: (provider: string) => `/social-auth/${provider}`,
  socialCallback: (provider: string) => `/social-auth/${provider}/callback`,
  availableTargets: (provider: string) => `/social-auth/${provider}/available-targets`,
  linkSelectedTargets: () => '/social-auth/link-selected',
  createPost: () => '/content',
}
