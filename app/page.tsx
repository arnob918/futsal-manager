import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Dashboard from "./dashboard/page";
import SignIn from "./signin/page";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If the user is signed in, reuse the dashboard page so the homepage shows the same content.
  if (session) {
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
