'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchRest } from '@/lib/custom-api/rest-client'
import { endpoints } from '@/lib/custom-api/endpoints'

export default function FacebookCallbackPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')

        if (!code) {
          throw new Error('Authorization code is missing')
        }

        const { data, error } = await fetchRest(endpoints.facebookCallback(code, state || undefined), {
          method: 'GET',
          requireAuth: true
        })

        if (error) {
          throw new Error(error.message || 'Failed to link Facebook account')
        }

        const result: any = data

        if (result?.success) {
          setStatus('success')
          setMessage('Facebook account linked successfully!')
          setData(result.data)

          if (window.opener) {
            window.opener.postMessage({
              type: 'FACEBOOK_AUTH_SUCCESS',
              data: result.data
            }, window.location.origin)
          }
        } else {
          throw new Error(result?.message || 'Failed to link Facebook account')
        }

      } catch (error) {
        console.error('Error processing Facebook callback:', error)
        setStatus('error')
        const errMsg = error instanceof Error ? error.message : 'An error occurred'
        setMessage(errMsg)
        if (window.opener) {
          window.opener.postMessage({
            type: 'FACEBOOK_AUTH_ERROR',
            error: errMsg
          }, window.location.origin)
        }
      }
    }

    processCallback()
  }, [searchParams])

  const handleClose = () => {
    if (window.opener) {
      window.close()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            Facebook Account Linking
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing your Facebook authorization...'}
            {status === 'success' && 'Your Facebook account has been successfully linked!'}
            {status === 'error' && 'There was an error linking your Facebook account.'}
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
              {window.opener ? 'Close Window' : 'Go Home'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
