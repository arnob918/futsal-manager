import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// This middleware wraps our auth checks and admin role protection
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Always allow public & auth infra
    if (
      pathname === "/signin" ||
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/_next") ||
      pathname === "/favicon.ico"
    ) {
      return NextResponse.next();
    }

    // Admin routes require admin role
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "ADMIN") {
        // Redirect non-admins to homepage
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    // Other protected sections just require auth
    const protectedPrefixes = ["/dashboard", "/funds"];
    const needsAuth = protectedPrefixes.some((p) => pathname.startsWith(p));

    // Allow if auth not needed, or if we have a token
    if (!needsAuth || token) {
      return NextResponse.next();
    }

    // Otherwise redirect to signin
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Match all routes except some public assets
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
