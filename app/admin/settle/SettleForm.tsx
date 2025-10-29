// app/(dashboard)/settle/SettleForm.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

type Match = {
  id: string;
  date: string; // ISO
  location: string | null;
  totalCost: number;
  settled: boolean;
};

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  lastPlayedAt: string | null; // ISO or null
};

export default function SettleForm({
  action,
  matches,
  users,
}: {
  action: (formData: FormData) => Promise<{ ok: boolean } | void>;
  matches: Match[];
  users: UserRow[];
}) {
  const router = useRouter();

  // Form state
  const [matchId, setMatchId] = React.useState(matches[0]?.id ?? "");
  const [totalBDT, setTotalBDT] = React.useState<string>("");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");

  React.useEffect(() => {
    console.log("pending:", pending);
  }, [pending]);

  // Filter users by search query (name/email)
  const filteredUsers = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const key = `${u.name ?? ""} ${u.email ?? ""}`.toLowerCase();
      return key.includes(q);
    });
  }, [users, query]);

  // Per-head split
  const count = selected.size;
  const totalNum = Number(totalBDT);
  const perHead =
    Number.isFinite(totalNum) && totalNum > 0 && count > 0
      ? Math.round((totalNum / count) * 100) / 100
      : 0;

  function toggleUser(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function selectAllVisible() {
    setSelected((prev) => {
      const ids = new Set(prev);
      filteredUsers.forEach((u) => ids.add(u.id));
      return ids;
    });
  }
  function clearSelection() {
    setSelected(new Set());
  }

  async function handleSubmit(formData: FormData) {
    setError("");
    setSuccess("");
    setPending(true);
    try {
      // Guard client-side
      if (!matchId) throw new Error("Please choose a match.");
      if (!Number.isFinite(totalNum) || totalNum <= 0)
        throw new Error("Enter a valid total amount (BDT).");
      if (!count) throw new Error("Select at least one participant.");

      // Inject selected participants + payer
      selected.forEach((id) => formData.append("participants", id));
      formData.set("matchId", matchId);

      const res = await action(formData);
      if (!res || (res as any).ok) {
        setSuccess("Match settled successfully.");
        // Reset + navigate to matches
        setTotalBDT("");
        setSelected(new Set());
        router.push("/admin/settle");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to settle match.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-10 flex justify-center px-3">
      <div className="w-full max-w-5xl space-y-5">
        <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Settle Match
            </h1>
            <p className="text-sm text-muted-foreground">
              Choose a past match, select participants, and confirm the total.
            </p>
          </div>
        </header>

        {/* Alerts */}
        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        )}

        <div className="relative rounded-xl border p-4 sm:p-6">
          {pending && (
            <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm">
                <Spinner />
                <span>Settling…</span>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              // Call the async handler but don't await here so React can update pending state
              void handleSubmit(fd);
            }}
            className="grid grid-cols-1 gap-4"
          >
            {/* Match */}
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Match (past)</span>
              <select
                className="rounded-lg border px-3 py-2 text-sm"
                name="matchId"
                required
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
              >
                {matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {prettyDate(new Date(m.date))}{" "}
                    {m.location ? `– ${m.location}` : ""}
                    {m.settled ? " (Settled)" : ""}
                  </option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">
                Only previous matches are listed (most recent first).
              </span>
            </label>

            {/* Total */}
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Total Cost (BDT)</span>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                name="totalBDT"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={totalBDT}
                onChange={(e) => setTotalBDT(e.target.value)}
                placeholder="e.g., 3600"
              />
              <span className="text-xs text-muted-foreground">
                Per head: <strong>{formatBDT(perHead)}</strong>{" "}
                {count ? `(${count} players)` : ""}
              </span>
            </label>

            {/* Participant search + actions */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex flex-1 items-center gap-2">
                  <span className="text-sm font-medium">Search players</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllVisible}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
                  >
                    Select shown
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Type name or email…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Participants grid */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((u) => {
                const checked = selected.has(u.id);
                return (
                  <label
                    key={u.id}
                    className={`rounded-lg border p-2 text-sm transition hover:shadow-sm cursor-pointer ${
                      checked ? "border-emerald-300 bg-emerald-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="participants"
                      value={u.id}
                      checked={checked}
                      onChange={() => toggleUser(u.id)}
                      className="mr-2 align-middle"
                    />
                    <span className="font-medium">
                      {u.name ?? u.email ?? "Player"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {u.email}
                      {u.lastPlayedAt
                        ? ` • last: ${shortDate(new Date(u.lastPlayedAt))}`
                        : " • no recent play"}
                    </span>
                  </label>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No players match your search.
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end">
              <button
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                type="submit"
                disabled={pending}
                title={pending ? "Settling…" : "Settle"}
              >
                {pending && <Spinner />}
                {pending ? "Settling…" : "Settle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block size-4 animate-spin rounded-full border-[2px] border-muted-foreground border-t-transparent"
      aria-hidden="true"
    />
  );
}

function prettyDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
function shortDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(d);
}
function formatBDT(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "—";
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)}৳`;
  }
}
