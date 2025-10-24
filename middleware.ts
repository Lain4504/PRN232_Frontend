import { updateSession } from "@/lib/supabase/middleware";
import { getSubscriptionMiddleware } from "@/lib/middleware/subscription-middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // First, handle authentication
  const authResponse = await updateSession(request);
  
  // Check if this is a dashboard route that needs profile context
  const pathname = request.nextUrl.pathname;
  
  // Routes that require profile context
  const profileRequiredRoutes = [
    '/dashboard',
    '/subscription'
  ];
  
  // Routes that require team context
  const teamRequiredRoutes = [
    '/teams'
  ];
  
  // Check if current path requires profile context
  const needsProfileContext = profileRequiredRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const needsTeamContext = teamRequiredRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // For now, let the client-side handle profile context validation
  // The dashboard layout will redirect to /overview if no active profile
  
  // Temporarily disable subscription middleware for debugging
  // const subscriptionMiddleware = getSubscriptionMiddleware();
  // return await subscriptionMiddleware(request);

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
