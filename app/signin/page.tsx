// app/signin/page.tsx
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          const res = await signIn("credentials", {
            email,
            password,
            redirect: false, // 👈 inspect first
            callbackUrl: "/dashboard",
          });
          if (!res || res.error) {
            setErr("Invalid email or password.");
            return;
          }
          window.location.href = res.url ?? "/dashboard";
        }}
        className="space-y-2"
      >
        <input
          className="border px-3 py-2 w-full"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border px-3 py-2 w-full"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="px-3 py-2 border rounded" type="submit">
          Sign in
        </button>
      </form>
      <a className="underline" href="/signup">
        Create an account
      </a>
    </div>
  );
}
