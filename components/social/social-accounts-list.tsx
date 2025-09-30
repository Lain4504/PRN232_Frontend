'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Facebook, Instagram, Twitter, Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { SocialAccount, SocialAccountsResponse } from '@/lib/provider/social-types'
import { endpoints } from '@/lib/custom-api/endpoints'
import { createClient } from '@/lib/supabase/client'

interface SocialAccountsListProps {
  userId: string
  onAccountUnlinked?: () => void
  className?: string
  onAccountClick?: (account: SocialAccount) => void
  onTargetClick?: (target: SocialAccount['targets'][number], account: SocialAccount) => void
}

export function SocialAccountsList({ userId, onAccountUnlinked, className, onAccountClick, onTargetClick }: SocialAccountsListProps) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null)
  const loadSocialAccounts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('Authentication required')
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5283/api'
      const response = await fetch(`${apiUrl}${endpoints.socialAccountsByUser(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data: SocialAccountsResponse = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error('Failed to load social accounts')
      }
      setAccounts(data.data)

    } catch (error) {
      console.error('Error loading social accounts:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const handleUnlinkAccount = async (socialAccountId: string) => {
    if (!confirm('Are you sure you want to unlink this account? This action cannot be undone.')) {
      return
    }

    try {
      setUnlinkingId(socialAccountId)

      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('Authentication required')
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5283/api'
      const response = await fetch(`${apiUrl}${endpoints.socialUnlink(userId, socialAccountId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (!response.ok || !(data as { success?: boolean })?.success) {
        throw new Error((data as { message?: string })?.message || 'Failed to unlink account')
      }
      
      setAccounts((prev: SocialAccount[]) => prev.filter((account: SocialAccount) => account.id !== socialAccountId))
      onAccountUnlinked?.()

    } catch (error) {
      console.error('Error unlinking account:', error)
      alert(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setUnlinkingId(null)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'facebook':
        return <Facebook className="h-5 w-5" />
      case 'instagram':
        return <Instagram className="h-5 w-5" />
      case 'twitter':
        return <Twitter className="h-5 w-5" />
      default:
        return <ExternalLink className="h-5 w-5" />
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

  useEffect(() => {
    if (userId) {
      loadSocialAccounts()
    }
  }, [userId, loadSocialAccounts])

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Social Accounts</CardTitle>
          <CardDescription>Manage your connected social media accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Social Accounts</CardTitle>
          <CardDescription>Manage your connected social media accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadSocialAccounts} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Social Accounts</CardTitle>
        <CardDescription>Manage your connected social media accounts</CardDescription>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No social accounts connected yet.</p>
            <p className="text-sm text-gray-400">Connect your social media accounts to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`border rounded-lg p-4`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getProviderColor(account.provider)} text-white`}>
                      {getProviderIcon(account.provider)}
                    </div>
                    <div>
                      <h3
                        className={`font-medium capitalize ${onAccountClick ? 'cursor-pointer hover:underline underline-offset-2' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          onAccountClick?.(account)
                        }}
                      >
                        {account.provider}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {account.providerUserId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={account.isActive ? 'default' : 'secondary'}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleUnlinkAccount(account.id) }}
                      disabled={unlinkingId === account.id}
                    >
                      {unlinkingId === account.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {account.targets && account.targets.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div>
                      <h4 className="text-sm font-medium mb-2">Pages & Groups ({account.targets.length})</h4>
                      <div className="space-y-2">
                        {account.targets.map((target) => (
                          <div
                            key={target.id}
                            className={`flex items-center space-x-3 p-2 rounded ${onTargetClick ? 'bg-white hover:bg-gray-50 border cursor-pointer transition-colors' : 'bg-gray-50'}`}
                            onClick={() => onTargetClick?.(target, account)}
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={target.profilePictureUrl} />
                              <AvatarFallback>
                                {target.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{target.name}</p>
                              <p className="text-xs text-gray-500 capitalize">
                                {target.type} • {target.category || 'No category'}
                              </p>
                            </div>
                            <Badge variant={target.isActive ? 'default' : 'secondary'} className="text-xs">
                              {target.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                <div className="mt-3 text-xs text-gray-400">
                  Connected: {new Date(account.createdAt).toLocaleDateString()}
                  {account.expiresAt && (
                    <span> • Expires: {new Date(account.expiresAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
