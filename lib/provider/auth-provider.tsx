'use client'

import { useEffect } from 'react'
import {useAuthStore} from "@/lib/store/auth-store";
import {getCurrentUser} from "@/app/actions/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser()
      setUser(user)
    }

    fetchUser()
  }, [setUser])

  return children
} 