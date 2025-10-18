import { createClient } from '@/lib/supabase/client'

// Types
export interface ApiResponse<T> {
  success: boolean
  message: string
  statusCode: number
  data: T
  timestamp: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
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

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const defaultHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' }
  const headers: Record<string, string> = {
    ...defaultHeaders,
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
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  },

  // POST
  post: async <T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, options)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json()
  },

  // POST multipart/form-data
  postForm: async <T>(url: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    // Let browser set the multipart boundary; do not set Content-Type
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: formData,
      headers: {},
    }, { ...options, headers: {} })
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

  // PUT multipart/form-data
  putForm: async <T>(url: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: formData,
      headers: {},
    }, { ...options, headers: {} })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  // DELETE
  delete: async <T>(url: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, { method: 'DELETE' }, options)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },

  // PATCH
  patch: async <T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, options)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  },
}

// Endpoints
export const endpoints = {
  // Team endpoints
  teams: "/team",
  teamsByVendor: (vendorId: string) => `/team/vendor/${vendorId}`,
  teamById: (teamId: string) => `/team/${teamId}`,
  createTeam: () => "/team",
  teamRestore: (teamId: string) => `/team/${teamId}/restore`,
  teamStatus: (teamId: string) => `/team/${teamId}/status`,
  teamAssignBrands: (teamId: string) => `/team/${teamId}/brands`,

  // Team Member endpoints
  teamMembers: (teamId: string) => `/team/${teamId}/members`,
  createTeamMember: () => `/team-members`,
  updateTeamMember: (memberId: string) => `/team-members/${memberId}`,
  deleteTeamMember: (memberId: string) => `/team-members/${memberId}`,
  teamMembersPaged: () => "/team-members",
  addTeamMember: (teamId: string) => `/team/${teamId}/members`,
  removeTeamMember: (teamId: string, userId: string) => `/team/${teamId}/members/${userId}`,
  updateTeamMemberRole: (teamId: string, userId: string) => `/team/${teamId}/members/${userId}`,

  // User endpoints
  userProfile: "/users/profile/me",
  userSearch: "/users",

  // Social Auth endpoints
  socialAuth: (provider: string) => `/social-auth/${provider}`,
  socialCallback: (provider: string) => `/social-auth/${provider}/callback`,

  // Social Accounts endpoints
  socialAccountsMe: () => '/social/accounts/me',
  socialAccountsUser: (userId: string) => `/social/accounts/user/${userId}`,
  socialAccountsWithTargets: () => '/social/accounts/me/accounts-with-targets',
  socialUnlinkAccount: (userId: string, socialAccountId: string) => `/social/accounts/unlink/${userId}/${socialAccountId}`,

  // Social Targets endpoints
  availableTargets: (socialAccountId: string) => `/social/accounts/${socialAccountId}/available-targets`,
  linkedTargets: (socialAccountId: string) => `/social/accounts/${socialAccountId}/linked-targets`,
  linkTargets: (socialAccountId: string) => `/social/accounts/${socialAccountId}/link-targets`,
  unlinkTarget: (userId: string, socialIntegrationId: string) => `/social/accounts/unlink-target/${userId}/${socialIntegrationId}`,

  // Brands endpoints
  brands: () => '/brands',
  
  // Content & Posts
  createPost: () => '/content',

  // Profiles
  profilesByUser: (userId: string, search?: string, isDeleted?: boolean) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (typeof isDeleted === 'boolean') params.set('isDeleted', String(isDeleted))
    const q = params.toString()
    return q ? `/profiles/user/${userId}?${q}` : `/profiles/user/${userId}`
  },
  profileById: (id: string) => `/profiles/${id}`,
  createProfile: (userId: string) => `/profiles/user/${userId}`,
  updateProfile: (id: string) => `/profiles/${id}`,
  deleteProfile: (id: string) => `/profiles/${id}`,
  restoreProfile: (id: string) => `/profiles/${id}/restore`,
}
