import { create } from 'zustand'
import {User} from "@/lib/provider/user-types";

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
  isAuthenticated: boolean
  setIsAuthenticated: (isAuthenticated: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  isAuthenticated: false,
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
})) 