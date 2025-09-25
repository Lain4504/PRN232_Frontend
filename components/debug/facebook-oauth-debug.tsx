'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/lib/store/auth-store'
import { fetchRest } from '@/lib/custom-api/rest-client'

export function FacebookOAuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuthStore()

  const testFacebookAuth = async () => {
    try {
      setIsLoading(true)
      setDebugInfo(null)

      console.log('=== Testing Facebook Auth URL ===')
      const { data: authData, error } = await fetchRest('/social-auth/facebook', {
        method: 'GET',
        requireAuth: true
      })

      if (error) {
        throw new Error(error.message || 'Failed to get Facebook authorization URL')
      }

      console.log('Auth URL Response:', authData)

      console.log('=== Current User Info ===')
      console.log('User:', user)

      const testCallbackUrl = `/social-auth/facebook/callback?code=test_code&state=test_state`
      console.log('Test Callback URL:', testCallbackUrl)

      setDebugInfo({
        authResponse: authData,
        user: user,
        testCallbackUrl,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Debug test failed:', error)
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testCallback = async () => {
    try {
      setIsLoading(true)
      
      const testUrl = `/social-auth/facebook/callback?code=test_code&state=test_state`
      const { data, error } = await fetchRest(testUrl, {
        method: 'GET',
        requireAuth: true
      })

      const result = data
      console.log('Callback test result:', result)
      
      setDebugInfo((prev: any) => ({
        ...prev,
        callbackTest: {
          url: testUrl,
          response: result,
          status: (result as any)?.status
        }
      }))

    } catch (error) {
      console.error('Callback test failed:', error)
      setDebugInfo((prev: any) => ({
        ...prev,
        callbackTest: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Facebook OAuth Debug</CardTitle>
        <CardDescription>
          Debug tools for Facebook OAuth integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={testFacebookAuth} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test Auth URL'}
          </Button>
          <Button onClick={testCallback} disabled={isLoading} variant="outline">
            {isLoading ? 'Testing...' : 'Test Callback'}
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-4">
            <h3 className="font-semibold">Debug Information:</h3>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Current User:</h4>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(debugInfo.user, null, 2)}
              </pre>
            </div>

            {debugInfo.authResponse && (
              <div className="bg-blue-100 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Auth URL Response:</h4>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo.authResponse, null, 2)}
                </pre>
              </div>
            )}

            {debugInfo.testCallbackUrl && (
              <div className="bg-green-100 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Test Callback URL:</h4>
                <code className="text-sm break-all">{debugInfo.testCallbackUrl}</code>
              </div>
            )}

            {debugInfo.callbackTest && (
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Callback Test Result:</h4>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo.callbackTest, null, 2)}
                </pre>
              </div>
            )}

            {debugInfo.error && (
              <div className="bg-red-100 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Error:</h4>
                <p className="text-sm text-red-600">{debugInfo.error}</p>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Last updated: {debugInfo.timestamp}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
