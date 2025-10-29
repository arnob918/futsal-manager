import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Dashboard from "./dashboard/page";
import SignIn from "./signin/page";
import { prisma } from "@/lib/db";
import Admin from "./admin/page";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) return <SignIn />;

  const userId = (session.user as any)?.id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true },
  });

  // If the user is signed in, reuse the dashboard page so the homepage shows the same content.
  if (user?.role === "ADMIN") {
    return <Admin />;
  } else if (session) {
    return <Dashboard />;
  }
  return <SignIn />;

  // return (
  //   <div className="space-y-3">
  //     <h1 className="text-3xl font-bold">Futsal Manager</h1>
  //     <p>Track matches, split costs automatically, and keep balances tidy.</p>
  //     <div className="max-w-sm mx-auto space-y-4">
  //       <button
  //         className="w-full border rounded px-3 py-2"
  //         onClick={() => signIn("google", { callbackUrl: "/" })}
  //       >
  //         Continue with Google
  //       </button>
  //     </div>
  //   </div>
  // );
}
