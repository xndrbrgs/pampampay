import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/api/stripe/connect', // Your Stripe webhook route
  '/api/stripe', // Your Stripe webhook route
  // Add other public routes here, if any
]);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - static (static files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!static|.*\\..*|_next|favicon.ico).*)',
    '/',
  ],
};

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // If the route is not public, continue to apply authentication
  return NextResponse.next();
});
