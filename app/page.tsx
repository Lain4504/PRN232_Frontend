'use client'

import { useAuthStore } from '@/lib/store/auth-store'
import { LogoutButton } from '@/components/auth/logout-button'
import { QuickSocialLink } from '@/components/social/quick-social-link'
import { SocialAccountsBadge } from '@/components/social/social-accounts-badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const { user, isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard
          </h1>
          <p className="text-gray-600">
            You are successfully logged in!
          </p>
        </div>

        {isAuthenticated && user && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  User Information
                  <SocialAccountsBadge />
                </CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Email:</span>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div>
                  <span className="font-medium">User ID:</span>
                  <p className="text-sm text-gray-600 font-mono">{user.id}</p>
                </div>
                <div>
                  <span className="font-medium">Roles:</span>
                  <p className="text-sm text-gray-600">{user.roles.join(', ')}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p className="text-sm text-green-600">
                    {user.isVerified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
                {user.socialAccounts && user.socialAccounts.length > 0 && (
                  <div>
                    <span className="font-medium">Social Accounts:</span>
                    <p className="text-sm text-gray-600">
                      {user.socialAccounts.length} connected account(s)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <LogoutButton />
                <div className="text-sm text-gray-500">
                  Click logout to sign out of your account
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Application information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Authentication:</span>
                  <p className="text-sm text-green-600">Active</p>
                </div>
                <div>
                  <span className="font-medium">Session:</span>
                  <p className="text-sm text-green-600">Valid</p>
                </div>
                <div>
                  <span className="font-medium">API Connection:</span>
                  <p className="text-sm text-green-600">Connected</p>
                </div>
              </CardContent>
            </Card>

            <div className="md:col-span-2 lg:col-span-3">
              <QuickSocialLink />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
