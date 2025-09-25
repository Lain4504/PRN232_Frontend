'use client'

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FacebookLinkButton } from '@/components/auth/facebook-link-button'
import { Facebook, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function QuickSocialLink() {
  const { user } = useAuth()

  const hasFacebookAccount = user?.socialAccounts?.some(account => account.provider === 'facebook')

  if (hasFacebookAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-500" />
            Social Accounts
          </CardTitle>
          <CardDescription>
            Manage your connected social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                You have {user?.socialAccounts?.length || 0} connected account(s)
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/social-accounts">
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="h-5 w-5 text-blue-500" />
          Connect Social Accounts
        </CardTitle>
        <CardDescription>
          Link your social media accounts to start managing your content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Connect your Facebook account to manage pages and schedule posts.
          </p>
          <div className="flex gap-2">
            <FacebookLinkButton
              onSuccess={() => {
                // Refresh the page or update state
                window.location.reload()
              }}
              onError={(error) => {
                console.error('Facebook linking error:', error)
                alert(`Failed to link Facebook account: ${error}`)
              }}
              variant="default"
              size="sm"
            />
            <Button asChild variant="outline" size="sm">
              <Link href="/social-accounts">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
