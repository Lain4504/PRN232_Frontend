'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth-store'
import { logoutUser } from '@/app/actions/auth'

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logoutUser()
      logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still logout locally even if API call fails
      logout()
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  )
}
