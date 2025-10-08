'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, AlertTriangle } from 'lucide-react'
import { useGetAuthUrl } from '@/hooks/use-social-accounts'
import { toast } from 'sonner'

interface ReAuthButtonProps {
  provider: 'facebook' | 'tiktok' | 'twitter'
  accountId: string
  expiresAt?: string
  className?: string
}

export function ReAuthButton({ provider, accountId, expiresAt, className }: ReAuthButtonProps) {
  const [isReAuthing, setIsReAuthing] = useState(false)
  const { refetch: getAuthUrl } = useGetAuthUrl(provider)
  
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false
  const isExpiringSoon = expiresAt ? {
    expires: new Date(expiresAt),
    now: new Date(),
    diff: new Date(expiresAt).getTime() - new Date().getTime(),
    daysLeft: Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  } : null

  const handleReAuth = async () => {
    try {
      setIsReAuthing(true)
      const { data: authData } = await getAuthUrl()
      
      if (authData?.authUrl) {
        // Redirect to OAuth URL
        window.location.href = authData.authUrl
      } else {
        toast.error('Failed to get authentication URL')
      }
    } catch (error) {
      console.error('Re-auth error:', error)
      toast.error('Failed to start re-authentication')
    } finally {
      setIsReAuthing(false)
    }
  }

  if (isExpired) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Expired
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReAuth}
          disabled={isReAuthing}
          className={className}
        >
          {isReAuthing ? (
            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-3 w-3" />
          )}
          Re-authenticate
        </Button>
      </div>
    )
  }

  if (isExpiringSoon && isExpiringSoon.daysLeft <= 7) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          Expires in {isExpiringSoon.daysLeft} day{isExpiringSoon.daysLeft !== 1 ? 's' : ''}
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReAuth}
          disabled={isReAuthing}
          className={className}
        >
          {isReAuthing ? (
            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-3 w-3" />
          )}
          Refresh Token
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleReAuth}
      disabled={isReAuthing}
      className={className}
    >
      {isReAuthing ? (
        <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-3 w-3" />
      )}
      Re-authenticate
    </Button>
  )
}
