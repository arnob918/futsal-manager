import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b px-4 py-2 flex gap-4 items-center">
          <Link href="/">Home</Link>
          {session ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/matches">Matches</Link>
              <Link href="/funds">Funds</Link>
              {role === "ADMIN" && <Link href="/admin">Admin</Link>}
              <form
                action="/api/auth/signout"
                method="post"
                className="ml-auto"
              >
                <button className="px-3 py-1 border rounded" type="submit">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link className="ml-auto" href="/signin">
              Sign in
            </Link>
          )}
        </nav>
        <main className="max-w-3xl mx-auto p-4">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
