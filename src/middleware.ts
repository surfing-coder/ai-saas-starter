import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Protects app routes: no session cookie -> redirect to sign-in.
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const signIn = new URL("/sign-in", request.url);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/account/:path*", "/billing/:path*"],
};
