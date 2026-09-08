import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import SignInButton from "./signin/sign-in-btn";
import NextTopLoader from "nextjs-toploader";
import BottomNav from "@/components/BottomNav";

import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Penalty Merchants",
  description: "Manage your futsal matches and funds easily.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png", // Replace with your actual image path
        width: 1200, // Recommended dimensions
        height: 630,
        alt: "Penalty Merchants OpenGraph Image",
      },
    ],
  },
};

// viewportFit: "cover" lets env(safe-area-inset-*) resolve to real values,
// which the fixed top nav and bottom tab bar rely on once installed as a PWA.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#10B981",
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
      <body className={`${inter.className} min-h-dvh bg-muted/30 text-foreground`}>
        <NextTopLoader color="#10B981" height={3} showSpinner={false} />

        <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pt-[env(safe-area-inset-top)]">
          <div className="flex h-14 items-center gap-2 px-4 sm:gap-4">
            <Link
              href="/"
              className="font-semibold tracking-tight hover:text-primary transition-colors"
            >
              Penalty Merchants
            </Link>

            {session ? (
              <>
                {/* Desktop links — on mobile these live in the bottom tab bar */}
                <div className="hidden md:flex md:items-center md:gap-4">
                  <Link
                    href="/dashboard"
                    className="hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/matches"
                    className="hover:text-primary transition-colors"
                  >
                    Matches
                  </Link>
                  {role !== "ADMIN" && (
                    <Link
                      href="/funds"
                      className="hover:text-primary transition-colors"
                    >
                      Funds
                    </Link>
                  )}
                  {role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="hover:text-primary transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/about"
                    className="hover:text-primary transition-colors"
                  >
                    About
                  </Link>
                </div>

                {/* Desktop profile dropdown — mobile uses the "Me" drawer */}
                <div className="ml-auto relative group hidden md:block">
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    {image ? (
                      <Image
                        src={image}
                        alt={name || "Profile"}
                        width={36}
                        height={36}
                        className="rounded-full border-2 border-border"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                        <span className="text-muted-foreground font-semibold text-sm">
                          {name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                  </button>
                  <div className="hidden group-focus-within:block absolute right-0 mt-2 w-48 bg-popover text-popover-foreground border rounded-lg shadow-lg z-50">
                    {name && (
                      <div className="px-4 py-2 border-b text-sm font-semibold">
                        {name}
                      </div>
                    )}
                    <form action="/api/auth/signout" method="post">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-accent text-destructive rounded-b-lg"
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
            )}
          </div>
        </nav>

        {/* Top offset clears the fixed nav; bottom offset clears the tab bar. */}
        <main className="mx-auto p-4 pt-[calc(3.5rem+1rem+env(safe-area-inset-top))] pb-[calc(3.5rem+1rem+env(safe-area-inset-bottom))] sm:p-6 sm:pt-[calc(3.5rem+1.5rem+env(safe-area-inset-top))] md:pb-6">
          {children}
        </main>

        {session && <BottomNav role={role} name={name} image={image} />}
        <Toaster />
      </body>
    </html>
  );
}
