import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// This pattern is the most reliable in App Router
const handler = NextAuth(authOptions);
console.log("AUTH DB:", process.env.DATABASE_URL);
export { handler as GET, handler as POST };
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// If you previously had `export const { GET, POST } = NextAuth(authOptions)`,
// either form is fine, but try the handler pattern if you see 405s.
