import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(raw);
        if (!parsed.success) {
          console.log("authorize: zod failed", parsed.error?.issues);
          return null;
        }

        const email = parsed.data.email.trim().toLowerCase();
        const password = parsed.data.password;

        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
        });
        if (!user) {
          console.log("authorize: user not found");
          return null;
        }
        if (!user.passwordHash) {
          console.log("authorize: no passwordHash");
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          console.log("authorize: bad password");
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) (session.user as any).id = token.sub;
      (session.user as any).role = token.role;
      return session;
    },
  },
  pages: { signIn: "/signin" },
};
