import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db"; // your Prisma singleton

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // or "database" if you prefer DB sessions
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // optional: limit to specific hosted domain
      // authorization: { params: { hd: "yourdomain.com" } },
    }),
  ],
  pages: {
    signIn: "/signin", // custom page (optional)
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // On first sign-in, NextAuth creates a User row via adapter. Your `role` default=USER will apply.
      // Attach role to token for easy checks
      if (user) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) (session.user as any).id = token.sub;
      (session.user as any).role = token.role;
      return session;
    },
    // Optional: block non-Google logins (defense-in-depth)
    async signIn({ account }) {
      return account?.provider === "google";
    },
  },
};
