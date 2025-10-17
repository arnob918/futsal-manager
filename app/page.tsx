import Link from "next/link";
export default function Home() {
  return (
    <div className="space-y-3">
      <h1 className="text-3xl font-bold">Futsal Manager</h1>
      <p>Track matches, split costs automatically, and keep balances tidy.</p>
      <div className="flex gap-2">
        <Link className="underline" href="/signup">
          Create account
        </Link>
        <Link className="underline" href="/signin">
          Sign in
        </Link>
      </div>
    </div>
  );
}
