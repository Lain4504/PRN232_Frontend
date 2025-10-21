import { updateSession } from "@/lib/supabase/middleware";
import { getSubscriptionMiddleware } from "@/lib/middleware/subscription-middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // First, handle authentication
  const authResponse = await updateSession(request);
  
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
