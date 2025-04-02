import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicPaths = [
  "/",
  "/api/stripe",
  "/api/stripe/connect",
  "/api/webhooks",
  "/api/payments",
  "/api/payments/coinbase",
  "/api/payments/coinbase/success",
  "/api/payments/coinbase/cancel",
];

const isPublic = createRouteMatcher(publicPaths);

export default clerkMiddleware(async (auth, request) => {
  if (isPublic(request)) {
    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
