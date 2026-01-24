import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get("auth_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Define protected and auth routes
  const isAuthRoute = pathname.startsWith("/auth") &&
    !pathname.startsWith("/auth/callback") &&
    !pathname.startsWith("/auth/error");

  const isProtectedRoute = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/overview") ||
    pathname.startsWith("/teams") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/subscription");

  // Logic: 
  // 1. If trying to access protected route without any token, redirect to login
  if (isProtectedRoute && !token && !refreshToken) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("return_to", pathname);
    return NextResponse.redirect(url);
  }

  // 2. If trying to access auth routes while already logged in, redirect to overview
  // Commented out to prevent infinite redirect loops if client side session is invalid
  // if (isAuthRoute && (token || refreshToken)) {
  //   return NextResponse.redirect(new URL("/overview", request.url));
  // }

  // For now, we trust the client-side auto-refresh logic in api.ts
  // If the token is expired but refreshToken exists, the first request on the client side will refresh it.

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
