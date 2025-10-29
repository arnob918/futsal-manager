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
    <div className="flex flex-col sm:flex-row gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => runAction("/api/admin/funds/approve")}
        className="w-full sm:w-auto px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {pending ? "Working…" : "Approve"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => runAction("/api/admin/funds/reject")}
        className="w-full sm:w-auto px-3 py-2 rounded border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
      >
        {pending ? "Working…" : "Reject"}
      </button>
    </div>
  );
}
