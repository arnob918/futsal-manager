"use client";
import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <button
        className="w-full border rounded px-3 py-2"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        Continue with Google
      </button>
    </div>
  );
}
