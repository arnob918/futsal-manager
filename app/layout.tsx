import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import SignInButton from "./signin/sign-in-btn";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Penalty Marchants",
  description: "Manage your futsal matches and funds easily.",
  icons: {
    icon: "/favicon.png",
  },
};

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const image = session?.user?.image;
  const name = session?.user?.name;

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="fixed top-0 left-0 right-0 bg-white border-b px-4 py-3 flex gap-2 sm:gap-4 items-center z-50">
          <Link
            href="/"
            className="font-semibold hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          {session ? (
            <>
              <Link
                href="/matches"
                className=" hover:text-blue-600 transition-colors"
              >
                Matches
              </Link>
              {role !== "ADMIN" && (
                <Link
                  href="/funds"
                  className=" hover:text-blue-600 transition-colors"
                >
                  Funds
                </Link>
              )}

              {/* Mobile menu */}
              {/* <div className="sm:hidden ml-auto relative group">
                <button className="px-3 py-1 border rounded hover:bg-gray-50">
                  Menu
                </button>
                <div className="hidden group-focus-within:block absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/matches"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Matches
                  </Link>
                  <Link
                    href="/funds"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Funds
                  </Link>
                  {role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Admin
                    </Link>
                  )}
                </div>
              </div> */}

              {/* Profile dropdown */}
              <div className="ml-auto sm:ml-auto relative group">
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {image ? (
                    <Image
                      src={image}
                      alt={name || "Profile"}
                      width={36}
                      height={36}
                      className="rounded-full border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center border-2 border-gray-200">
                      <span className="text-gray-600 font-semibold text-sm">
                        {name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </button>
                <div className="hidden group-focus-within:block absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                  {name && (
                    <div className="px-4 py-2 border-b text-sm font-semibold text-gray-700">
                      {name}
                    </div>
                  )}
                  <form action="/api/auth/signout" method="post">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                      type="submit"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <SignInButton />
            // <Link
            //   className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            //   href="/signin"
            // >
            //   Sign in
            // </Link>
          )}
        </nav>
        <main className="mx-auto p-4 sm:p-6">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
