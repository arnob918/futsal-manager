"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Users, Wallet, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type Props = {
  role?: string;
  name?: string | null;
  image?: string | null;
};

const tabClass =
  "flex flex-1 flex-col items-center justify-center gap-1 min-h-14 px-1 text-[11px] font-medium transition-colors";

export default function BottomNav({ role, name, image }: Props) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";

  // Mirrors the top-nav logic in app/layout.tsx: admins get /admin in place of /funds.
  const links = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/matches", label: "Matches", icon: Users },
    isAdmin
      ? { href: "/admin", label: "Admin", icon: Shield }
      : { href: "/funds", label: "Funds", icon: Wallet },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      <div className="flex items-stretch">
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                tabClass,
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}

        <Drawer>
          <DrawerTrigger
            className={cn(tabClass, "text-muted-foreground hover:text-foreground")}
          >
            {image ? (
              <Image
                src={image}
                alt=""
                width={20}
                height={20}
                className="size-5 rounded-full border"
              />
            ) : (
              <User className="size-5" />
            )}
            <span>Me</span>
          </DrawerTrigger>

          <DrawerContent className="pb-[env(safe-area-inset-bottom)]">
            <DrawerHeader className="text-left">
              <DrawerTitle>{name || "Your account"}</DrawerTitle>
              <DrawerDescription>
                {isAdmin ? "Administrator" : "Player"}
              </DrawerDescription>
            </DrawerHeader>

            <Separator />

            <div className="flex flex-col gap-1 p-4">
              <Button variant="ghost" className="justify-start h-11" asChild>
                <Link href="/about">About</Link>
              </Button>
              {isAdmin && (
                <Button variant="ghost" className="justify-start h-11" asChild>
                  <Link href="/funds">Funds</Link>
                </Button>
              )}
              <form action="/api/auth/signout" method="post">
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start h-11 text-destructive hover:text-destructive"
                >
                  Sign out
                </Button>
              </form>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
}
