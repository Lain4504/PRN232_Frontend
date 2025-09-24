export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  avatarUrl: string | null;
  backgroundUrl?: string | null;
  roles: string[];
  isVerified?: boolean;
}
