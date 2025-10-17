"use client";
import { useState } from "react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch("/api/signup", {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
          });
          if (res.ok) window.location.href = "/signin";
          else alert("Sign up failed");
        }}
        className="space-y-2"
      >
        <input
          className="border px-3 py-2 w-full"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
        <button className="px-3 py-2 border rounded" type="submit">
          Create account
        </button>
      </form>
    </div>
  );
}
