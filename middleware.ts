import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthTokens } from './app/actions/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { accessToken } = await getAuthTokens()

  // Public routes that don't require authentication
  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.includes(pathname)

  // If user is on login page and already authenticated, redirect to home
  if (pathname === '/login' && accessToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is trying to access protected routes without authentication, redirect to login
  if (!isPublicRoute && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
