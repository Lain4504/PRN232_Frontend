import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {User} from "@/lib/provider/user-types";
import { SocialAccount } from '@/lib/provider/social-types'

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
  isAuthenticated: boolean
  setIsAuthenticated: (isAuthenticated: boolean) => void
  login: (user: User) => void
  logout: () => void
  updateUserSocialAccounts: (socialAccounts: SocialAccount[]) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
      isAuthenticated: false,
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUserSocialAccounts: (socialAccounts) => set((state) => ({
        user: state.user ? { ...state.user, socialAccounts } : null
      })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
) 