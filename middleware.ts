import { clerkMiddleware } from "@clerk/nextjs/server"
import type { NextFetchEvent, NextRequest } from "next/server"
import { NextResponse } from "next/server"

export default function middleware(request: NextRequest) {
  // Force HTTPS
  if (
    !request.nextUrl.pathname.startsWith("/_next") && // Exclude Next.js internals
    !request.nextUrl.pathname.startsWith("/api/") && // Exclude API routes
    request.headers.get("x-forwarded-proto") !== "https"
  ) {
    return NextResponse.redirect(`https://${request.headers.get("host")}${request.nextUrl.pathname}`, 301)
  }

  // Check if the request is for a Stripe webhook
  if (request.nextUrl.pathname.startsWith("/api/stripe")) {
    const response = NextResponse.next()

    // Set CORS headers for Stripe webhooks
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Stripe-Signature")

    return response
  }

  // For all other routes, use Clerk middleware
  return clerkMiddleware()(request, {} as NextFetchEvent)
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}

