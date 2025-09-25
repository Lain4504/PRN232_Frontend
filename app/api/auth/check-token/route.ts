import { NextResponse } from 'next/server'
import { getAuthTokens } from '@/app/actions/auth'

export async function GET() {
  try {
    const { accessToken } = await getAuthTokens()
    return NextResponse.json({ accessToken })
  } catch (error) {
    console.error('Error checking token:', error)
    return NextResponse.json({ accessToken: null })
  }
} 