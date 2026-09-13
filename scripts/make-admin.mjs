// Promote a local user to ADMIN (local testing helper).
//
//   node --env-file=.env scripts/make-admin.mjs              # list users
//   node --env-file=.env scripts/make-admin.mjs you@mail.com # promote to ADMIN
//
// Sign in with Google once first so NextAuth creates the User row, then run
// this — new users default to role USER and /admin/* redirects them away.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const email = process.argv[2];

try {
  if (!email) {
    const users = await prisma.user.findMany({
      select: { email: true, name: true, role: true, balance: true },
      orderBy: { createdAt: "asc" },
    });

    if (users.length === 0) {
      console.log(
        "No users yet. Sign in at http://localhost:3000 with Google first."
      );
    } else {
      console.table(users);
      console.log("\nPromote one with:\n  node --env-file=.env scripts/make-admin.mjs <email>");
    }
  } else {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
      select: { email: true, name: true, role: true },
    });
    console.log(`${user.email} is now ${user.role}`);
    console.log("Sign out and back in — role is baked into the JWT at sign-in.");
  }
} catch (err) {
  if (err.code === "P2025") {
    console.error(`No user with email "${email}". Run without arguments to list users.`);
    process.exit(1);
  }
  throw err;
} finally {
  await prisma.$disconnect();
}
