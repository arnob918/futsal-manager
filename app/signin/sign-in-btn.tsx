"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      onClick={() => signIn("google", { callbackUrl: "/" })}
    >
      Sign In
    </button>
  );
}
