'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FacebookLinkButton } from '@/components/auth/facebook-link-button'
import { FacebookPageTokenLink } from '@/components/auth/facebook-page-token-link'
import { SocialAccountsList } from '@/components/social/social-accounts-list'
import { FacebookOAuthDebug } from '@/components/debug/facebook-oauth-debug'
import { Facebook, Plus } from 'lucide-react'

export default function SocialAccountsPage() {
  const { user, isAuthenticated } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAccountLinked = () => {
    // Trigger refresh of social accounts list
    setRefreshKey(prev => prev + 1)
  }

  const handleAccountUnlinked = () => {
    // Trigger refresh of social accounts list
    setRefreshKey(prev => prev + 1)
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-4">Please log in to manage your social accounts.</p>
              <Button asChild>
                <a href="/login">Go to Login</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Accounts</h1>
          <p className="text-gray-600">
            Connect and manage your social media accounts to streamline your content management.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Connect New Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Connect New Account
              </CardTitle>
              <CardDescription>
                Link your social media accounts to start managing your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <FacebookLinkButton
                  onSuccess={handleAccountLinked}
                  onError={(error) => {
                    console.error('Facebook linking error:', error)
                    alert(`Failed to link Facebook account: ${error}`)
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                />
                
                {/* Placeholder for other social platforms */}
                <Button variant="outline" disabled className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  <span>Instagram (Coming Soon)</span>
                </Button>
                
                <Button variant="outline" disabled className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  <span>TikTok (Coming Soon)</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Temporary Page Token Link */}
          <FacebookPageTokenLink
            onSuccess={handleAccountLinked}
            onError={(error) => {
              console.error('Facebook page linking error:', error)
              alert(`Failed to link Facebook page: ${error}`)
            }}
          />

          {/* Connected Accounts */}
          <SocialAccountsList
            key={refreshKey}
            userId={user.id}
            onAccountUnlinked={handleAccountUnlinked}
          />
        </div>

        {/* Debug Section */}
        <FacebookOAuthDebug />

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Learn more about connecting and managing your social media accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Why connect social accounts?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Schedule posts across multiple platforms</li>
                  <li>• Manage all your pages from one place</li>
                  <li>• Track engagement and analytics</li>
                  <li>• Automate content distribution</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Security & Privacy</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your credentials are encrypted and secure</li>
                  <li>• You can unlink accounts anytime</li>
                  <li>• We only access necessary permissions</li>
                  <li>• Your data is never shared with third parties</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
