// middleware.ts (project root)
import { withAuth } from "next-auth/middleware";

// Static PWA files. These must never be redirected to /signin: a service worker
// script that 302s to HTML fails registration with a MIME-type error, and a
// manifest that does the same makes the install prompt silently disappear —
// neither leaves anything in the logs.
const PWA_PATHS = ["/sw.js", "/manifest.webmanifest", "/offline.html"];

export default withAuth({
  pages: { signIn: "/signin" },
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;

      // Always allow public & auth infra
      if (
        pathname === "/signin" ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/icons/") ||
        PWA_PATHS.includes(pathname)
      ) {
        return true;
      }

      // Only these sections require auth
      const protectedPrefixes = ["/dashboard", "/funds", "/admin"];
      const needsAuth = protectedPrefixes.some((p) => pathname.startsWith(p));

      return needsAuth ? !!token : true;
    },
  },
});

// The allowlist above governs everything this matcher lets through. The PWA
// files are excluded here as well so they don't boot an edge function on every
// service-worker update check — the allowlist entries are defence in depth, in
// case this pattern and that list ever drift apart.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|offline.html|icons/).*)",
  ],
};
