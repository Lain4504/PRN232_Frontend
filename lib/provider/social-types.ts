export interface SocialTarget {
  id: string;
  providerTargetId: string;
  name: string;
  type: 'page' | 'group' | 'profile';
  category?: string;
  profilePictureUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccount {
  id: string;
  provider: 'facebook' | 'instagram' | 'tiktok' | 'twitter';
  providerUserId: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  targets: SocialTarget[];
}

export interface FacebookAuthResponse {
  success: boolean;
  data: {
    authUrl: string;
    state: string;
  };
}

export interface SocialLinkResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      createdAt: string;
    };
    socialAccount: SocialAccount;
    message: string;
  };
}

export interface SocialAccountsResponse {
  success: boolean;
  data: SocialAccount[];
}

export interface UnlinkResponse {
  success: boolean;
  message: string;
}

// Available targets (opt-in) response
export interface AvailableTargetsResponse {
  success: boolean;
  data: {
    targets: Array<{
      id?: string; // not set in available list
      providerTargetId: string;
      name: string;
      type: 'page' | 'group' | 'profile';
      category?: string;
      profilePictureUrl?: string;
      isActive: boolean;
    }>;
  };
}

// Link selected targets request/response
export interface LinkSelectedRequestBody {
  userId: string;
  provider: 'facebook';
  providerTargetIds: string[];
}

export interface LinkSelectedResponse {
  success: boolean;
  data: SocialAccount;
}