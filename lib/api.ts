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
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5283/api'

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
  delete: async <T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const requestOptions: RequestInit = { method: 'DELETE' }
    
    if (data) {
      requestOptions.body = JSON.stringify(data)
      requestOptions.headers = { 'Content-Type': 'application/json' }
    }
    
    const response = await fetchWithAuth(url, requestOptions, options)
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

  // POST Multipart (for file uploads)
  postMultipart: async <T>(url: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const { requireAuth = true } = options || {}

    const authHeader: Record<string, string> = {}
    if (requireAuth) {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        authHeader['Authorization'] = `Bearer ${session.access_token}`
      }
    }

    // Don't set Content-Type for FormData, let browser set it with boundary
    const headers: Record<string, string> = {
      ...(options?.headers || {}),
      ...authHeader,
    }

    console.log('Sending multipart request to:', `${API_URL}${url}`)
    console.log('Headers:', headers)

    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      body: formData,
      headers,
    })

    console.log('Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error ${response.status}:`, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    return response.json()
  },

  // PUT Multipart (for file uploads)
  putMultipart: async <T>(url: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const { requireAuth = true } = options || {}

    const authHeader: Record<string, string> = {}
    if (requireAuth) {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        authHeader['Authorization'] = `Bearer ${session.access_token}`
      }
    }

    // Don't set Content-Type for FormData, let browser set it with boundary
    const headers: Record<string, string> = {
      ...(options?.headers || {}),
      ...authHeader,
    }

    const response = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      body: formData,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error ${response.status}:`, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
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
  teamUnassignBrand: (teamId: string) => `/team/${teamId}/brands`,

  // Team Member endpoints
  teamMembers: (teamId: string) => `/team/${teamId}/members`,
  createTeamMember: () => `/team-members`,
  updateTeamMember: (memberId: string) => `/team-members/${memberId}`,
  deleteTeamMember: (memberId: string) => `/team-members/${memberId}`,
  teamMembersPaged: () => "/team-members",
  addTeamMember: (teamId: string) => `/team/${teamId}/members`,
  removeTeamMember: (teamId: string, userId: string) => `/team/${teamId}/members/${userId}`,
  updateTeamMemberRole: (teamId: string, userId: string) => `/team/${teamId}/members/${userId}`,

  // Team Invitation endpoints
  teamInvitations: (teamId: string) => `/team/${teamId}/invitations`,
  teamInvitationById: (invitationId: string) => `/team-invitations/${invitationId}`,
  sendTeamInvitation: (teamId: string) => `/team/${teamId}/invitations`,
  resendTeamInvitation: (invitationId: string) => `/team-invitations/${invitationId}/resend`,
  cancelTeamInvitation: (invitationId: string) => `/team-invitations/${invitationId}`,
  acceptTeamInvitation: (invitationId: string) => `/team-invitations/${invitationId}/accept`,
  rejectTeamInvitation: (invitationId: string) => `/team-invitations/${invitationId}/reject`,

  // Team Activity endpoints
  teamActivity: (teamId: string) => `/team/${teamId}/activity`,
  teamAnalytics: (teamId: string) => `/team/${teamId}/analytics`,

  // Team Billing endpoints
  teamBilling: (teamId: string) => `/team/${teamId}/billing`,
  teamInvoices: (teamId: string) => `/team/${teamId}/invoices`,
  updateTeamBilling: (teamId: string) => `/team/${teamId}/billing`,
  cancelTeamSubscription: (teamId: string) => `/team/${teamId}/billing/cancel`,
  reactivateTeamSubscription: (teamId: string) => `/team/${teamId}/billing/reactivate`,
  downloadTeamInvoice: (invoiceId: string) => `/team-invoices/${invoiceId}/download`,

  // Team Settings endpoints
  teamSettings: (teamId: string) => `/team/${teamId}/settings`,
  updateTeamSettings: (teamId: string) => `/team/${teamId}/settings`,
  updateTeam: (teamId: string) => `/team/${teamId}`,
  deleteTeam: (teamId: string) => `/team/${teamId}`,
  archiveTeam: (teamId: string) => `/team/${teamId}/archive`,
  restoreTeam: (teamId: string) => `/team/${teamId}/restore`,

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

  // Ad Accounts endpoints
  adAccounts: (socialAccountId: string) => `/social/accounts/${socialAccountId}/ad-accounts`,

  // Brands endpoints
  brands: () => '/brands/team',
  brandsByTeam: (teamId: string) => `/brands/team/${teamId}`,
  brandById: (brandId: string) => `/brands/${brandId}`,

  // Products endpoints
  products: () => '/products',
  productById: (productId: string) => `/products/${productId}`,
  createProduct: () => '/products',
  updateProduct: (productId: string) => `/products/${productId}`,
  deleteProduct: (productId: string) => `/products/${productId}`,
  restoreProduct: (productId: string) => `/products/${productId}/restore`,

  // Profile endpoints
  profiles: () => '/profiles',
  profileById: (profileId: string) => `/profiles/${profileId}`,
  profilesMe: () => '/users/profile/me',

  // Approval endpoints
  approvals: () => '/approvals',
  approvalsPending: () => '/approvals/pending',
  approvalById: (approvalId: string) => `/approvals/${approvalId}`,
  approvalApprove: (approvalId: string) => `/approvals/${approvalId}/approve`,
  approvalReject: (approvalId: string) => `/approvals/${approvalId}/reject`,
  approvalsByContent: (contentId: string) => `/approvals/content/${contentId}`,
  approvalsByApprover: (approverId: string) => `/approvals/approver/${approverId}`,
  approvalRestore: (approvalId: string) => `/approvals/${approvalId}/restore`,
  approvalContentPending: (contentId: string) => `/approvals/content/${contentId}/pending`,

  // Content endpoints
  contents: () => '/content',
  contentById: (contentId: string) => `/content/${contentId}`,
  contentSubmit: (contentId: string) => `/content/${contentId}/submit`,
  contentPublish: (contentId: string, integrationId: string) => `/content/${contentId}/publish/${integrationId}`,
  contentRestore: (contentId: string) => `/content/${contentId}/restore`,
  // AI Chat endpoints
  aiChat: () => '/ai/chat',

  // Conversation Management endpoints
  conversations: () => '/conversations',
  conversationById: (id: string) => `/conversations/${id}`,
  profilesByUser: (userId: string, search?: string, isDeleted?: boolean) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (isDeleted !== undefined) params.append('isDeleted', isDeleted.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return `/profiles/user/${userId}${queryString}`;
  },
  createProfile: (userId: string) => `/profiles/user/${userId}`,
  updateProfile: (profileId: string) => `/profiles/${profileId}`,
  deleteProfile: (profileId: string) => `/profiles/${profileId}`,
  restoreProfile: (profileId: string) => `/profiles/${profileId}/restore`,

  // Campaign endpoints
  campaigns: (params?: { brandId?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.brandId) searchParams.append('brandId', params.brandId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return `/ad-campaigns${queryString}`;
  },
  campaignById: (campaignId: string) => `/ad-campaigns/${campaignId}`,
  createCampaign: () => '/ad-campaigns',
  updateCampaign: (campaignId: string) => `/ad-campaigns/${campaignId}`,
  deleteCampaign: (campaignId: string) => `/ad-campaigns/${campaignId}`,

  // Ad Set endpoints
  adSets: (params?: { campaignId?: string; page?: number; pageSize?: number; search?: string; status?: string; sortBy?: string; sortOrder?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.campaignId) searchParams.append('campaignId', params.campaignId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return `/ad-sets${queryString}`;
  },
  adSetById: (adSetId: string) => `/ad-sets/${adSetId}`,
  createAdSet: () => '/ad-sets',
  updateAdSet: (adSetId: string) => `/ad-sets/${adSetId}`,
  deleteAdSet: (adSetId: string) => `/ad-sets/${adSetId}`,

  // Creative endpoints
  creatives: (params?: { adSetId?: string; page?: number; pageSize?: number; search?: string; type?: string; tags?: string[]; sortBy?: string; sortOrder?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.adSetId) searchParams.append('adSetId', params.adSetId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.tags && params.tags.length > 0) searchParams.append('tags', params.tags.join(','));
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return `/ad-creatives${queryString}`;
  },
  creativeById: (creativeId: string) => `/ad-creatives/${creativeId}`,
  createCreative: () => '/ad-creatives',
  updateCreative: (creativeId: string) => `/ad-creatives/${creativeId}`,
  deleteCreative: (creativeId: string) => `/ad-creatives/${creativeId}`,
  creativeMetrics: (creativeId: string) => `/ad-creatives/${creativeId}/metrics`,

  // Ad endpoints
  ads: (params: { adSetId: string; status?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    searchParams.append('adSetId', params.adSetId);
    if (params.status) searchParams.append('status', params.status);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return `/ads${queryString}`;
  },
  adById: (adId: string) => `/ads/${adId}`,
  createAd: () => '/ads',
  updateAd: (adId: string) => `/ads/${adId}`,
  deleteAd: (adId: string) => `/ads/${adId}`,
  adStatus: (adId: string) => `/ads/${adId}/status`,
  bulkAdStatus: () => `/ads/status/bulk`,

  // Notification endpoints
  notifications: () => '/notifications',
  notificationById: (notificationId: string) => `/notifications/${notificationId}`,
  markNotificationAsRead: (notificationId: string) => `/notifications/${notificationId}/read`,
  markAllNotificationsAsRead: () => '/notifications/read/all',
  getUnreadNotificationCount: () => '/notifications/unread/count',

  // Content Calendar endpoints
  contentCalendar: {
    schedule: (contentId: string) => `/content-calendar/schedule/${contentId}`,
    scheduleRecurring: (contentId: string) => `/content-calendar/schedule-recurring/${contentId}`,
    cancelSchedule: (scheduleId: string) => `/content-calendar/schedule/${scheduleId}`,
    updateSchedule: (scheduleId: string) => `/content-calendar/schedule/${scheduleId}`,
    upcoming: (limit?: number) => `/content-calendar/upcoming${limit ? `?limit=${limit}` : ''}`,
  },

  // Posts endpoints
  posts: {
    list: (params?: { page?: number; pageSize?: number; status?: string; platform?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
      if (params?.status) searchParams.append('status', params.status);
      if (params?.platform) searchParams.append('platform', params.platform);
      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return `/posts${queryString}`;
    },
    byContent: (contentId: string) => `/posts/content/${contentId}`,
    byIntegration: (integrationId: string) => `/posts/integration/${integrationId}`,
  },
}
