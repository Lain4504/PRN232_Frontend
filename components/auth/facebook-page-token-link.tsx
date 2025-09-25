'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Facebook, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { fetchRest } from '@/lib/custom-api/rest-client'
import { endpoints } from '@/lib/custom-api/endpoints'

interface FacebookPageTokenLinkProps {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  className?: string
}

export function FacebookPageTokenLink({ 
  onSuccess, 
  onError, 
  className 
}: FacebookPageTokenLinkProps) {
  const [pageAccessToken, setPageAccessToken] = useState('')
  const [userAccessToken, setUserAccessToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const handleLinkPage = async () => {
    if (!pageAccessToken.trim()) {
      onError?.('Page Access Token is required')
      return
    }

    if (!user?.id) {
      onError?.('User not authenticated')
      return
    }

    try {
      setIsLoading(true)

      const { data, error } = await fetchRest(endpoints.facebookLinkPageToken(), {
        method: 'POST',
        requireAuth: true,
        body: {
          userId: user.id,
          pageAccessToken: pageAccessToken.trim(),
          userAccessToken: userAccessToken.trim() || undefined
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to link Facebook page')
      }

      const result: any = data
      
      if (result?.success) {
        onSuccess?.(result.data)
        setPageAccessToken('')
        setUserAccessToken('')
      } else {
        throw new Error(result?.message || 'Failed to link Facebook page')
      }

    } catch (error) {
      console.error('Error linking Facebook page:', error)
      onError?.(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="h-5 w-5 text-blue-500" />
          Link Facebook Page (Temporary)
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        </CardTitle>
        <CardDescription>
          <strong>⚠️ TEMPORARY:</strong> This is a temporary method to link Facebook pages using Page Access Token. 
          This will be replaced with proper OAuth flow in the future.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="pageToken" className="block text-sm font-medium mb-2">
            Page Access Token *
          </label>
          <Input
            id="pageToken"
            type="password"
            placeholder="Enter your Facebook Page Access Token"
            value={pageAccessToken}
            onChange={(e) => setPageAccessToken(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Get this from Facebook Graph API Explorer or your Facebook App
          </p>
        </div>

        <div>
          <label htmlFor="userToken" className="block text-sm font-medium mb-2">
            User Access Token (Optional)
          </label>
          <Input
            id="userToken"
            type="password"
            placeholder="Enter your Facebook User Access Token (optional)"
            value={userAccessToken}
            onChange={(e) => setUserAccessToken(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional: User access token for additional permissions
          </p>
        </div>

        <Button
          onClick={handleLinkPage}
          disabled={isLoading || !pageAccessToken.trim()}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Facebook className="h-4 w-4" />
          )}
          <span className="ml-2">
            {isLoading ? 'Linking...' : 'Link Facebook Page'}
          </span>
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>How to get Page Access Token:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Go to Facebook Graph API Explorer</li>
            <li>Select your app and get User Access Token</li>
            <li>Use the token to get Page Access Token</li>
            <li>Copy the Page Access Token and paste it above</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
