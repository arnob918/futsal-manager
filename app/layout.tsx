import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/Toaster";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignInButton from "./signin/sign-in-btn";
import NextTopLoader from "nextjs-toploader";
import BottomNav from "@/components/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#252525" },
  ],
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const image = session?.user?.image;
  const name = session?.user?.name;

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/matches", label: "Matches" },
    ...(role === "ADMIN"
      ? [{ href: "/admin", label: "Admin" }]
      : [{ href: "/funds", label: "Funds" }]),
    { href: "/about", label: "About" },
  ];

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-muted/30 font-sans text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#10B981" height={3} showSpinner={false} />

          <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pt-[env(safe-area-inset-top)]">
            <div className="flex h-14 items-center gap-2 px-4 sm:gap-6">
              <Link
                href="/"
                className="font-semibold tracking-tight transition-colors hover:text-primary"
              >
                Penalty Merchants
              </Link>

              {session ? (
                <>
                  {/* Desktop links — on mobile these live in the bottom tab bar */}
                  <nav className="hidden items-center gap-1 md:flex">
                    {navLinks.map(({ href, label }) => (
                      <Button key={href} variant="ghost" size="sm" asChild>
                        <Link href={href}>{label}</Link>
                      </Button>
                    ))}
                  </nav>

                  <div className="ml-auto flex items-center gap-1">
                    <div className="hidden md:block">
                      <ThemeToggle />
                    </div>

                    {/* Desktop account menu — mobile uses the "Me" drawer */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className="hidden md:flex">
                        <button
                          className="rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                          aria-label="Account menu"
                        >
                          <Avatar className="size-9">
                            {image && <AvatarImage src={image} alt="" />}
                            <AvatarFallback>
                              {name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        {name && (
                          <>
                            <DropdownMenuLabel>{name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {role === "ADMIN" && (
                          <DropdownMenuItem asChild>
                            <Link href="/funds">Funds</Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild variant="destructive">
                          <form
                            action="/api/auth/signout"
                            method="post"
                            className="w-full"
                          >
                            <button type="submit" className="w-full text-left">
                              Sign out
                            </button>
                          </form>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                <div className="ml-auto flex items-center gap-1">
                  <ThemeToggle />
                  <SignInButton />
                </div>
              )}
            </div>
          </header>

          {/* Top offset clears the fixed header; bottom offset clears the tab bar. */}
          <main className="mx-auto max-w-6xl p-4 pt-[calc(3.5rem+1rem+env(safe-area-inset-top))] pb-[calc(3.5rem+1rem+env(safe-area-inset-bottom))] sm:p-6 sm:pt-[calc(3.5rem+1.5rem+env(safe-area-inset-top))] md:pb-6">
            {children}
          </main>

          {session && <BottomNav role={role} name={name} image={image} />}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
