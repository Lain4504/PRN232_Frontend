'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api, endpoints } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'
import { SocialLinkResponse } from '@/lib/types/social-types'

type LoadState = 'loading' | 'success' | 'error'

function GenericCallbackContent() {
  const { provider } = useParams<{ provider: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<LoadState>('loading')
  const [message, setMessage] = useState('')
  const [data, setData] = useState<SocialLinkResponse['data'] | null>(null)

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state') || undefined
        // Derive userId from Supabase session instead of query
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const userId = session?.user?.id || ''

        if (!code) throw new Error('Authorization code is missing')
        if (!userId) throw new Error('User is not authenticated')

        // POST to generic callback endpoint with JSON body (no auth required)
        const result = await api.post<SocialLinkResponse['data']>(
          endpoints.socialCallback(provider),
          { code, userId, state },
          { requireAuth: true }
        )

        if (result?.success) {
          setStatus('success')
          setMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account linked successfully!`)
          setData(result.data)

          if (window.opener) {
            window.opener.postMessage({
              type: `${provider.toUpperCase()}_AUTH_SUCCESS`,
              data: result.data,
            }, window.location.origin)
          }
        } else {
          throw new Error('Failed to link account')
        }
      } catch (error) {
        console.error('Error processing social callback:', error)
        setStatus('error')
        const errMsg = error instanceof Error ? error.message : 'An error occurred'
        setMessage(errMsg)
        if (window.opener) {
          window.opener.postMessage({
            type: `${String(provider).toUpperCase()}_AUTH_ERROR`,
            error: errMsg,
          }, window.location.origin)
        }
      }
    }

    processCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router, provider])

  const handleClose = () => {
    if (window.opener) {
      window.close()
    } else {
      window.location.href = '/'
    }
  }

  const title = `${provider?.toString().charAt(0).toUpperCase()}${provider?.toString().slice(1)} Account Linking`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            {title}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && `Processing your ${provider} authorization...`}
            {status === 'success' && `Your ${provider} account has been successfully linked!`}
            {status === 'error' && `There was an error linking your ${provider} account.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">{message}</p>
              {data?.socialAccount && (
                <div className="text-sm text-gray-600">
                  <p>Account ID: {data.socialAccount.providerUserId}</p>
                  <p>Pages: {data.socialAccount.targets?.length || 0}</p>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-red-600 font-medium">{message}</p>
            </div>
          )}

          <div className="mt-6">
            <Button onClick={handleClose} className="w-full">
              {typeof window !== 'undefined' && window.opener ? 'Close Window' : 'Go Home'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function GenericCallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            Social Account Linking
          </CardTitle>
          <CardDescription>
            Loading...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SocialCallbackPage() {
  return (
    <Suspense fallback={<GenericCallbackLoading />}>
      <GenericCallbackContent />
    </Suspense>
  )
}


