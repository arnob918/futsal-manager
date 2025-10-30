// middleware.ts (project root)
import { withAuth } from "next-auth/middleware";

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
        pathname === "/favicon.ico"
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

// Use a broad matcher so our allowlist above actually governs everything
export const config = {
  matcher: ["/:path*"],
};
