"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      className="ml-auto inline-flex h-10 items-center rounded-md bg-primary px-4 text-primary-foreground transition-colors hover:bg-primary/90"
      onClick={() => signIn("google", { callbackUrl: "/" })}
    >
      Sign In
    </button>
  );
}
