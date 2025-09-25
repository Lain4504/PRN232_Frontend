'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Facebook, Loader2 } from 'lucide-react'
import { FacebookAuthResponse } from '@/lib/provider/social-types'
import { useAuthStore } from '@/lib/store/auth-store'
import { fetchRest } from '@/lib/custom-api/rest-client'
import { endpoints } from '@/lib/custom-api/endpoints'

interface FacebookLinkButtonProps {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function FacebookLinkButton({ 
  onSuccess, 
  onError, 
  className,
  variant = 'default',
  size = 'default'
}: FacebookLinkButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLinkFacebook = async () => {
    try {
      setIsLoading(true)

      const { data, error } = await fetchRest<FacebookAuthResponse>(endpoints.facebookAuth(), {
        method: 'GET',
        requireAuth: true
      })

      if (error) {
        throw new Error(error.message || 'Failed to get Facebook authorization URL')
      }

      const apiData: any = data

      if (apiData?.success) {
        let authUrl = apiData.data.authUrl as string

        if (authUrl.includes('https://www.facebook.com?') && !authUrl.includes('/dialog/oauth')) {
          const url = new URL(authUrl)
          const params = new URLSearchParams(url.search)
          authUrl = `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`
        }

        const popup = window.open(
          authUrl,
          'facebook-auth',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        )

        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return

          if (event.data.type === 'FACEBOOK_AUTH_SUCCESS') {
            onSuccess?.(event.data.data)
            popup?.close()
            window.removeEventListener('message', messageListener)
          } else if (event.data.type === 'FACEBOOK_AUTH_ERROR') {
            onError?.(event.data.error)
            popup?.close()
            window.removeEventListener('message', messageListener)
          }
        }

        window.addEventListener('message', messageListener)

        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed)
            window.removeEventListener('message', messageListener)
            setIsLoading(false)
          }
        }, 1000)

      } else {
        throw new Error('Failed to get authorization URL')
      }

    } catch (error) {
      console.error('Error linking Facebook account:', error)
      onError?.(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLinkFacebook}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Facebook className="h-4 w-4" />
      )}
      <span className="ml-2">
        {isLoading ? 'Connecting...' : 'Link Facebook'}
      </span>
    </Button>
  )
}
