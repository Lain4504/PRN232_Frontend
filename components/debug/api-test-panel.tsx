'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/lib/store/auth-store'
import { createClient } from '@/lib/supabase/client'
import { fetchRest } from '@/lib/custom-api/rest-client'
import { endpoints } from '@/lib/custom-api/endpoints'

export function ApiTestPanel() {
  const { user } = useAuthStore()
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testSupabaseToken = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.access_token) {
        setResult(`✅ Supabase Token OK\n\nToken: ${session.access_token.substring(0, 50)}...\n\nUser ID: ${session.user.id}\nEmail: ${session.user.email}`)
      } else {
        setResult('❌ No Supabase session found. Please login.')
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testBackendConnection = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5283'
      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setResult(`✅ Backend is running at ${apiUrl}\n\nStatus: ${response.status} ${response.statusText}`)
      } else {
        setResult(`⚠️ Backend responded with error\n\nStatus: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      setResult(`❌ Cannot connect to backend\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nMake sure backend is running at ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5283'}`)
    } finally {
      setLoading(false)
    }
  }

  const testUserProfile = async () => {
    if (!user) {
      setResult('❌ Please login first')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setResult('❌ No Supabase token found')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5283'
      const response = await fetch(`${apiUrl}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ User Profile API OK\n\n${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`❌ API Error\n\nStatus: ${response.status}\n\n${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testSocialAccounts = async () => {
    if (!user) {
      setResult('❌ Please login first')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await fetchRest(
        endpoints.socialAccountsByUser(user.id),
        {
          method: 'GET',
          requireAuth: true
        }
      )

      if (error) {
        setResult(`❌ API Error\n\n${error.message}\n\nStatus: ${error.status}`)
      } else {
        setResult(`✅ Social Accounts API OK\n\n${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔧 API Test Panel</CardTitle>
        <CardDescription>
          Debug tool để test API connection và authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testSupabaseToken} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test Supabase Token
          </Button>
          
          <Button 
            onClick={testBackendConnection} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Test Backend Connection
          </Button>
          
          <Button 
            onClick={testUserProfile} 
            disabled={loading || !user}
            variant="outline"
            size="sm"
          >
            Test User Profile API
          </Button>
          
          <Button 
            onClick={testSocialAccounts} 
            disabled={loading || !user}
            variant="outline"
            size="sm"
          >
            Test Social Accounts API
          </Button>
        </div>

        {result && (
          <div className="mt-4">
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
          <p><strong>User ID:</strong> {user ? user.id : 'N/A'}</p>
          <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5283'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
