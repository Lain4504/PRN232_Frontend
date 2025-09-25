// Centralized REST API endpoint path builders (path-only)
// Use these with fetchRest, which adds the API base URL.

export const endpoints = {
  // Social accounts
  socialAccountsByUser: (userId: string) => `/social/accounts/user/${userId}`,
  socialUnlink: (userId: string, socialAccountId: string) => `/social-auth/unlink/${userId}/${socialAccountId}`,

  // Facebook social auth
  facebookAuth: (state?: string) => `/social-auth/facebook${state ? `?state=${encodeURIComponent(state)}` : ''}`,
  facebookCallback: (code: string, state?: string) => `/social-auth/facebook/callback?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`,
  facebookLinkPageToken: () => `/social-auth/link-page-token`,
}

export type Endpoints = typeof endpoints


