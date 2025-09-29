import { createClient as createBrowserClient } from '@/lib/supabase/client'

interface RestResponse<T = unknown> {
  data?: T
  error?: {
    message: string
    status?: number
  }
}

interface RestRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: FormData | Record<string, unknown>
  requireAuth?: boolean
  headers?: Record<string, string>
}

/**
 * Utility function to make REST API requests
 * Works in both client and server environments
 * Uses Supabase authentication
 * 
 * @param endpoint API endpoint path (without base URL)
 * @param options REST request options
 * @returns Promise with the REST response
 */
export async function fetchRest<T = unknown>(
  endpoint: string,
  {
    method = 'GET',
    body,
    requireAuth = false,
    headers = {}
  }: RestRequestOptions = {}
): Promise<RestResponse<T>> {
  const isServer = typeof window === 'undefined'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5283/api'
  const fullUrl = `${apiUrl}${endpoint}`

  // Prepare headers
  const requestHeaders: Record<string, string> = {
    ...headers
  }

  // Add Content-Type header if not FormData
  if (!(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  // Add authentication if required
  if (requireAuth) {
    let accessToken: string | undefined

    // Always use client-side Supabase for now
    // Server-side API calls should be done through Server Actions or Route Handlers
    try {
      const supabase = createBrowserClient()
      const { data } = await supabase.auth.getSession()
      accessToken = data.session?.access_token
    } catch (error) {
      console.error('Error getting token from Supabase:', error)
    }

    if (!accessToken) {
      throw new Error('Authentication required but no token found')
    }

    requestHeaders['Authorization'] = `Bearer ${accessToken}`
  }

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      credentials: 'include'
    })

    const result = await response.json()

    // Check if the API response indicates an error (even with HTTP 200)
    if (result.success === false) {
      return {
        data: result, // Return the full response as data so we can access errors
        error: {
          message: result.message || "Request failed",
          status: response.status
        }
      }
    }

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        return {
          error: {
            message: "Tên đăng nhập hoặc mật khẩu không đúng",
            status: response.status
          }
        }
      }

      // Return the error message from the API if available
      return {
        error: {
          message: result.message || result.error || `HTTP error! status: ${response.status}`,
          status: response.status
        }
      }
    }

    return {
      data: result
    }
  } catch (error) {
    console.error('REST request failed:', error)
    
    // Handle network errors or other unexpected errors
    return {
      error: {
        message: error instanceof Error 
          ? (error.message.includes("Failed to fetch") 
              ? "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn."
              : error.message)
          : "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.",
        status: error instanceof Response ? error.status : undefined
      }
    }
  }
}

/**
 * Example usage:
 * 
 * // Upload file
 * const formData = new FormData()
 * formData.append('file', file)
 * formData.append('ownerType', 'NOVEL')
 * 
 * const { data, error } = await fetchRest('/api/images/upload', {
 *   method: 'POST',
 *   body: formData,
 *   requireAuth: true
 * })
 * 
 * // GET request
 * const { data, error } = await fetchRest('/api/novels', {
 *   requireAuth: true
 * })
 * 
 * // POST request with JSON body
 * const { data, error } = await fetchRest('/api/novels', {
 *   method: 'POST',
 *   body: {
 *     title: 'Novel Title',
 *     description: 'Novel Description'
 *   },
 *   requireAuth: true
 * })
 */ 