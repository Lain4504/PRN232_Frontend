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

// Token refresh management
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing) return refreshPromise!;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const savedSession = localStorage.getItem("auth_session");
      if (!savedSession) {
        // If no session but cookies might exist (desync), clear cookies
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        return false;
      }

      const session = JSON.parse(savedSession);
      const refreshToken = session.refreshToken;

      if (!refreshToken) return false;

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          localStorage.setItem("auth_session", JSON.stringify(json.data));
          // Update cookies for middleware
          document.cookie = `auth_token=${json.data.accessToken}; path=/; max-age=${60 * 60}; SameSite=Lax`;
          document.cookie = `refresh_token=${json.data.refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
          return true;
        }
      }

      // If refresh fails, clear session
      localStorage.removeItem("auth_session");
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      return false;
    } catch (error) {
      console.error("Token refresh failed", error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Auth fetch helper
async function fetchWithAuth(url: string, options: RequestInit = {}, reqOptions: ApiRequestOptions = {}): Promise<Response> {
  const { requireAuth = true } = reqOptions

  let accessToken: string | undefined

  if (requireAuth) {
    const savedSession = localStorage.getItem("auth_session");
    if (savedSession) {
      const session = JSON.parse(savedSession);
      accessToken = session.accessToken;
    }
  }

  const authHeader: Record<string, string> = {}
  if (accessToken) {
    authHeader['Authorization'] = `Bearer ${accessToken}`
  }

  // Add profile and team context headers
  const contextHeaders: Record<string, string> = {}
  if (typeof window !== 'undefined') {
    const activeProfileId = localStorage.getItem('activeProfileId')
    const activeTeamId = localStorage.getItem('activeTeamId')

    if (activeProfileId) {
      contextHeaders['X-Profile-Id'] = activeProfileId
    }
    if (activeTeamId) {
      contextHeaders['X-Team-Id'] = activeTeamId
    }
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const defaultHeaders: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' }
  const headers: Record<string, string> = {
    ...defaultHeaders,
    ...(options.headers as Record<string, string> || {}),
    ...(reqOptions.headers || {}),
    ...authHeader,
    ...contextHeaders,
  }

  let response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  })

  // Handle auto refresh on 401
  if (response.status === 401 && requireAuth && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry with new token
      const savedSession = localStorage.getItem("auth_session");
      if (savedSession) {
        const session = JSON.parse(savedSession);
        const newAccessToken = session.accessToken;
        const newHeaders = {
          ...headers,
          'Authorization': `Bearer ${newAccessToken}`
        };
        response = await fetch(`${API_URL}${url}`, {
          ...options,
          headers: newHeaders,
        });
      }
    } else {
      // Refresh failed, redirect to login if we're in the browser
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
        // Clear all auth cookies to ensure middleware doesn't redirect back
        document.cookie = "auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
        document.cookie = "refresh_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

        // Clear local storage just in case
        localStorage.removeItem("auth_session");

        window.location.href = '/auth/login';
      }
    }
  }

  return response;
}

// API methods
export const api = {
  // GET
  get: async <T>(url: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {}, options)

    let json
    try {
      const text = await response.text()
      json = text ? JSON.parse(text) : {}
    } catch (e) {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      // If OK but parsing failed/empty, default to empty object
      json = {}
    }

    if (!response.ok) {
      throw new Error(json.message || `HTTP ${response.status}`)
    }
    return json
  },

  // POST
  post: async <T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, options)

    let json
    try {
      const text = await response.text()
      json = text ? JSON.parse(text) : {}
    } catch (e) {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      json = {}
    }

    if (!response.ok) {
      throw new Error(json.message || `HTTP ${response.status}`)
    }
    return json
  },

  // POST multipart/form-data
  postForm: async <T>(url: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: formData,
      headers: {},
    }, { ...options, headers: {} })

    let json
    try {
      const text = await response.text()
      json = text ? JSON.parse(text) : {}
    } catch (e) {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      json = {}
    }

    if (!response.ok) throw new Error(json.message || `HTTP ${response.status}`)
    return json
  },

  // PUT
  put: async <T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, options)

    let json
    try {
      const text = await response.text()
      json = text ? JSON.parse(text) : {}
    } catch (e) {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      json = {}
    }

    if (!response.ok) throw new Error(json.message || `HTTP ${response.status}`)
    return json
  },

  // PUT multipart/form-data
  putForm: async <T>(url: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: formData,
      headers: {},
    }, { ...options, headers: {} })

    let json
    try {
      const text = await response.text()
      json = text ? JSON.parse(text) : {}
    } catch (e) {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      json = {}
    }

    if (!response.ok) throw new Error(json.message || `HTTP ${response.status}`)
    return json
  },

  // DELETE
  delete: async <T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const requestOptions: RequestInit = { method: 'DELETE' }

    if (data) {
      requestOptions.body = JSON.stringify(data)
      requestOptions.headers = { 'Content-Type': 'application/json' }
    }

    const response = await fetchWithAuth(url, requestOptions, options)

    let json
    try {
      const text = await response.text()
      json = text ? JSON.parse(text) : {}
    } catch (e) {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      json = {}
    }

    if (!response.ok) throw new Error(json.message || `HTTP ${response.status}`)
    return json
  },

  // PATCH
  patch: async <T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }, options)

    let json
    try {
      const text = await response.text()
      json = text ? JSON.parse(text) : {}
    } catch (e) {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      json = {}
    }

    if (!response.ok) throw new Error(json.message || `HTTP ${response.status}`)
    return json
  },

  // POST Multipart (for file uploads)
  postMultipart: async <T>(url: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'POST',
      body: formData,
    }, options)

    let json
    try {
      const text = await response.text()
      json = text ? JSON.parse(text) : {}
    } catch (e) {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      json = {}
    }

    if (!response.ok) throw new Error(json.message || `HTTP ${response.status}`)
    return json
  },

  // PUT Multipart (for file uploads)
  putMultipart: async <T>(url: string, formData: FormData, options?: ApiRequestOptions): Promise<ApiResponse<T>> => {
    const response = await fetchWithAuth(url, {
      method: 'PUT',
      body: formData,
    }, options)

    let json
    try {
      const text = await response.text()
      json = text ? JSON.parse(text) : {}
    } catch (e) {
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      json = {}
    }

    if (!response.ok) throw new Error(json.message || `HTTP ${response.status}`)
    return json
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
  teamStats: (teamId: string) => `/team/${teamId}/stats`,

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
  userProfile: "/auth/me",
  changePassword: "/auth/change-password",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/change-password-with-token",
  resendVerification: "/auth/verify-email/resend",
  userSearch: "/users",
  verifyEmail: (token: string) => `/auth/verify-email?token=${token}`,

  // Social Auth endpoints
  socialAuth: (provider: string) => `/social-auth/${provider}`,
  socialCallback: (provider: string) => `/social-auth/${provider}/callback`,

  // Social Accounts endpoints
  socialAccountsMe: () => '/social/accounts/me',
  socialAccountsUser: (userId: string) => `/social/accounts/user/${userId}`,
  socialAccountsWithTargets: () => '/social/accounts/me/accounts-with-targets',
  socialUnlinkAccount: (socialAccountId: string) => `/social/accounts/unlink/${socialAccountId}`,
  googleLogin: () => "/auth/google",

  // Social Targets endpoints
  availableTargets: (socialAccountId: string) => `/social/accounts/${socialAccountId}/available-targets`,
  linkedTargets: (socialAccountId: string) => `/social/accounts/${socialAccountId}/linked-targets`,
  linkTargets: (socialAccountId: string) => `/social/accounts/${socialAccountId}/link-targets`,
  unlinkTarget: (socialIntegrationId: string) => `/social/accounts/unlink-target/${socialIntegrationId}`,

  // Ad Accounts endpoints
  adAccounts: (socialAccountId: string) => `/social/accounts/${socialAccountId}/ad-accounts`,

  // Brands endpoints
  brands: (params?: { page?: number; pageSize?: number; searchTerm?: string; sortBy?: string; sortDescending?: boolean; teamId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortDescending !== undefined) searchParams.append('sortDescending', params.sortDescending.toString());
    if (params?.teamId) searchParams.append('teamId', params.teamId);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return `/brands${queryString}`;
  },
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
  approvalChangeApprover: (approvalId: string) => `/approvals/${approvalId}/approver`,
  approvalAvailableApprovers: (brandId: string) => `/approvals/brands/${brandId}/available-approvers`,
  approvalsByContent: (contentId: string) => `/approvals/content/${contentId}`,
  approvalsByApprover: (approverId: string) => `/approvals/approver/${approverId}`,
  approvalRestore: (approvalId: string) => `/approvals/${approvalId}/restore`,
  approvalContentPending: (contentId: string) => `/approvals/content/${contentId}/pending`,

  // Content endpoints
  contents: () => '/content',
  contentById: (contentId: string) => `/content/${contentId}`,
  contentSubmit: (contentId: string) => `/content/${contentId}/submit`,
  contentPublish: (contentId: string, integrationId: string) => `/content/${contentId}/publish/${integrationId}`,
  contentClone: (contentId: string) => `/content/${contentId}/clone`,
  contentRestore: (contentId: string) => `/content/${contentId}/restore`,

  // Social Integration endpoints
  socialIntegrations: () => '/social/integrations',
  socialIntegrationsByBrand: (brandId: string) => `/social/integrations/brand/${brandId}`,
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
  campaigns: (params?: { brandId?: string; teamId?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.brandId) searchParams.append('brandId', params.brandId);
    if (params?.teamId) searchParams.append('teamId', params.teamId);
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
  // Backend supports listing ad sets by campaign via route param, not query
  adSetsByCampaign: (campaignId: string) => `/ad-sets/campaign/${campaignId}`,
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
  facebookPosts: (params?: { brandId?: string; pageId?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.brandId) searchParams.append('brandId', params.brandId);
    if (params?.pageId) searchParams.append('pageId', params.pageId);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return `/ad-creatives/facebook/posts${queryString}`;
  },
  creativeById: (creativeId: string) => `/ad-creatives/${creativeId}`,
  creativePreview: (creativeId: string, adFormat?: string) => `/ad-creatives/${creativeId}/previews${adFormat ? `?adFormat=${encodeURIComponent(adFormat)}` : ''}`,
  // Keep legacy for compatibility (backend still supports but deprecated)
  createCreative: () => '/ad-creatives',
  createCreativeFromContent: () => '/ad-creatives/from-content',
  createCreativeFromFacebookPost: () => '/ad-creatives/from-facebook-post',
  creativeByContent: (contentId: string) => `/ad-creatives/content/${contentId}`,
  updateCreative: (creativeId: string) => `/ad-creatives/${creativeId}`,
  deleteCreative: (creativeId: string) => `/ad-creatives/${creativeId}`,
  creativeMetrics: (creativeId: string) => `/ad-creatives/${creativeId}/metrics`,

  // Ad endpoints
  ads: (params: { campaignId?: string; brandId?: string; status?: string; page?: number; pageSize?: number }) => {
    const searchParams = new URLSearchParams();
    if (params.campaignId) searchParams.append('campaignId', params.campaignId);
    if (params.brandId) searchParams.append('brandId', params.brandId);
    if (params.status) searchParams.append('status', params.status);
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return `/ads${queryString}`;
  },
  adById: (adId: string) => `/ads/${adId}`,
  adPreview: (adId: string, adFormat?: string) => `/ads/${adId}/previews${adFormat ? `?adFormat=${encodeURIComponent(adFormat)}` : ''}`,
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
    upcoming: (limit?: number, brandId?: string) => {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (brandId) params.append('brandId', brandId)
      return `/content-calendar/upcoming${params.toString() ? `?${params.toString()}` : ''}`
    },
    byTeam: (teamId: string, limit?: number) => `/content-calendar/team/${teamId}${limit ? `?limit=${limit}` : ''}`,
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
    byId: (postId: string) => `/posts/${postId}`,
    byContent: (contentId: string) => `/posts/content/${contentId}`,
    byIntegration: (integrationId: string) => `/posts/integration/${integrationId}`,
  },

  // Storage endpoints
  storageUpload: (bucket: string) => `/storage/${bucket}/upload`,

  // Payment endpoints
  paymentHistory: () => '/payment/history',

  // Dashboard endpoints
  dashboardStats: (teamId?: string) => `/dashboard/stats${teamId ? `?teamId=${teamId}` : ''}`,
}
