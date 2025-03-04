import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const publicPaths = ["/", "/api/stripe", "/api/stripe/connect", "/api/webhook"]

const isPublic = createRouteMatcher(publicPaths)

export default clerkMiddleware(async (auth, request) => {
  if (isPublic(request)) {
    return NextResponse.next()
  }
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

