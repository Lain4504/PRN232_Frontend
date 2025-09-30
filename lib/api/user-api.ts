import { getWithAuth } from './client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5283'

export interface UserProfile {
  id: string
  email: string
  createdAt: string
  socialAccounts?: SocialAccount[]
}

export interface SocialAccount {
  id: string
  provider: string
  providerUserId: string
  accessToken?: string
  isActive: boolean
  expiresAt?: string
  createdAt: string
  targets?: SocialTarget[]
}

export interface SocialTarget {
  id: string
  providerTargetId: string
  name: string
  type: string
  isActive: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

/**
 * Get current user profile from backend
 */
export async function getUserProfile(): Promise<ApiResponse<UserProfile>> {
  return getWithAuth<ApiResponse<UserProfile>>(`${API_URL}/api/users/profile`)
}

/**
 * Get user's social accounts
 */
export async function getSocialAccounts(): Promise<ApiResponse<SocialAccount[]>> {
  return getWithAuth<ApiResponse<SocialAccount[]>>(`${API_URL}/api/users/social-accounts`)
}
