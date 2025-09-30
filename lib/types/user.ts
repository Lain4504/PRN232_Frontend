export interface SocialAccountDto {
  id: string;
  provider: string;
  providerId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  linkedAt: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  createdAt: string;
  socialAccounts: SocialAccountDto[];
}

export interface ErrorDetails {
  code?: string;
  details?: string;
  field?: string;
}

export interface GenericResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  error?: ErrorDetails;
  timestamp: string;
}
