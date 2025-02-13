import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/api/stripe(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) (await auth()).redirectToSignIn();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};