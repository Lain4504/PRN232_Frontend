'use client'

import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'
import { Facebook, Instagram, Twitter } from 'lucide-react'
import Link from 'next/link'

interface SocialAccountsBadgeProps {
  className?: string
  showCount?: boolean
}

export function SocialAccountsBadge({ className, showCount = true }: SocialAccountsBadgeProps) {
  const { user } = useAuth()

  if (!user?.socialAccounts || user.socialAccounts.length === 0) {
    return null
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'facebook':
        return <Facebook className="h-3 w-3" />
      case 'instagram':
        return <Instagram className="h-3 w-3" />
      case 'twitter':
        return <Twitter className="h-3 w-3" />
      default:
        return null
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'facebook':
        return 'bg-blue-500'
      case 'instagram':
        return 'bg-pink-500'
      case 'twitter':
        return 'bg-sky-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {user.socialAccounts.map((account) => (
        <Link
          key={account.id}
          href="/social-accounts"
          className="flex items-center gap-1"
        >
          <Badge 
            variant="secondary" 
            className={`${getProviderColor(account.provider)} text-white hover:opacity-80 transition-opacity`}
          >
            {getProviderIcon(account.provider)}
            {showCount && account.targets && account.targets.length > 0 && (
              <span className="ml-1 text-xs">
                {account.targets.length}
              </span>
            )}
          </Badge>
        </Link>
      ))}
    </div>
  )
}
