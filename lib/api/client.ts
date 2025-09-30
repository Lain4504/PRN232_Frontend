import { createClient } from '@/lib/supabase/client'

/**
 * Fetch wrapper that automatically includes Supabase JWT token in Authorization header
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  
  // Add Authorization header with Supabase JWT token
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }
  
  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Helper to make GET requests with auth
 */
export async function getWithAuth<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, { method: 'GET' })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

/**
 * Helper to make POST requests with auth
 */
export async function postWithAuth<T>(url: string, data: unknown): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

/**
 * Helper to make PUT requests with auth
 */
export async function putWithAuth<T>(url: string, data: unknown): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

/**
 * Helper to make DELETE requests with auth
 */
export async function deleteWithAuth<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, { method: 'DELETE' })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}
