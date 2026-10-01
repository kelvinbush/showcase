import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { DEMO_MODE } from "@/lib/config";

/**
 * Attaches the Clerk auth context. Route protection lives in
 * app/(app)/layout.tsx and app/(access)/layout.tsx, and investor access itself
 * is enforced by the API on every request.
 */
export default DEMO_MODE ? () => NextResponse.next() : clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
