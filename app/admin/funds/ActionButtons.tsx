"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function ActionButtons({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function runAction(endpoint: string) {
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Request failed");
      // Refresh the current route so server components re-run and reflect changes
      router.refresh();
    } catch (e) {
      console.error(e);
      // Optionally show a toast here
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
      <button
        type="button"
        disabled={pending}
        onClick={() => runAction("/api/admin/funds/approve")}
        className="h-11 w-full rounded bg-primary px-3 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:h-10 sm:w-auto"
      >
        {pending ? "Working…" : "Approve"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => runAction("/api/admin/funds/reject")}
        className="h-11 w-full rounded border border-rose-200 px-3 text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-50 sm:h-10 sm:w-auto"
      >
        {pending ? "Working…" : "Reject"}
      </button>
    </div>
  );
}
