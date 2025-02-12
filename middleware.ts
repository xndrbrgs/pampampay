import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextRequest, NextResponse, NextFetchEvent } from "next/server"

export default function middleware(request: NextRequest) {
  // Check if the request is for a Stripe webhook
  if (request.nextUrl.pathname.startsWith("/api/stripe")) {
    const response = NextResponse.next()

    // Allow requests from Stripe's IP addresses
    // You may want to restrict this further based on Stripe's IP ranges
    response.headers.set("Access-Control-Allow-Origin", "*")

    // Allow the Stripe-Signature header
    response.headers.set("Access-Control-Allow-Headers", "Stripe-Signature, Content-Type")

    // Allow POST method for webhooks
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")

    return response
  }

  // For all other routes, use Clerk middleware
  return clerkMiddleware()(request, {} as NextFetchEvent)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}

