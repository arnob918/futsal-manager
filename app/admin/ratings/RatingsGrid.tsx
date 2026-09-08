// app/admin/ratings/RatingsGrid.tsx
"use client";

import * as React from "react";
import { savePlayerSkills } from "@/app/(actions)/teamActions";
import { POSITIONS, DEFAULT_SCORE, type Position } from "@/lib/teams";

type Player = {
  id: string;
  name: string | null;
  email: string | null;
  scores: Record<string, number>;
};

const POSITION_LABELS: Record<Position, string> = {
  GOALKEEPER: "GK",
  DEFENDER: "DEF",
  MIDFIELDER: "MID",
  FORWARD: "FWD",
};

export default function RatingsGrid({ players }: { players: Player[] }) {
  const [query, setQuery] = React.useState("");
  // edits[userId][position] = score; only holds changed cells
  const [edits, setEdits] = React.useState<
    Record<string, Partial<Record<Position, number>>>
  >({});
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) =>
      `${p.name ?? ""} ${p.email ?? ""}`.toLowerCase().includes(q)
    );
  }, [players, query]);

  function currentScore(p: Player, pos: Position): number {
    return edits[p.id]?.[pos] ?? p.scores[pos] ?? DEFAULT_SCORE;
  }

  function setScore(p: Player, pos: Position, score: number) {
    if (score < 1 || score > 10) return;
    setSuccess("");
    setEdits((prev) => ({
      ...prev,
      [p.id]: { ...prev[p.id], [pos]: score },
    }));
  }

  const changedCount = React.useMemo(
    () =>
      players.reduce((acc, p) => {
        const e = edits[p.id];
        if (!e) return acc;
        return (
          acc +
          POSITIONS.filter(
            (pos) =>
              e[pos] !== undefined && e[pos] !== (p.scores[pos] ?? DEFAULT_SCORE)
          ).length
        );
      }, 0),
    [players, edits]
  );

  async function handleSave() {
    setError("");
    setSuccess("");
    setPending(true);
    try {
      const updates: { userId: string; position: Position; score: number }[] =
        [];
      for (const p of players) {
        const e = edits[p.id];
        if (!e) continue;
        for (const pos of POSITIONS) {
          const v = e[pos];
          if (v !== undefined && v !== (p.scores[pos] ?? DEFAULT_SCORE)) {
            updates.push({ userId: p.id, position: pos, score: v });
          }
        }
      }
      if (updates.length === 0) {
        setSuccess("Nothing to save.");
        return;
      }
      await savePlayerSkills(updates);
      setEdits({});
      setSuccess(`Saved ${updates.length} rating${updates.length > 1 ? "s" : ""}.`);
    } catch (e: any) {
      setError(e?.message || "Failed to save ratings.");
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
              Player Ratings
            </h1>
            <p className="text-sm text-muted-foreground">
              Score each player 1–10 per position. Unrated positions count as{" "}
              {DEFAULT_SCORE}. Used by the team builder.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={pending || changedCount === 0}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            {pending
              ? "Saving…"
              : changedCount > 0
              ? `Save ${changedCount} change${changedCount > 1 ? "s" : ""}`
              : "Save"}
          </button>
        </header>

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

        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Search name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-3 py-2 font-medium">Player</th>
                {POSITIONS.map((pos) => (
                  <th key={pos} className="px-3 py-2 text-center font-medium">
                    {POSITION_LABELS[pos]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-3 py-2">
                    <span className="font-medium">
                      {p.name ?? p.email ?? "Player"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {p.email}
                    </span>
                  </td>
                  {POSITIONS.map((pos) => {
                    const value = currentScore(p, pos);
                    const changed =
                      edits[p.id]?.[pos] !== undefined &&
                      edits[p.id]?.[pos] !== (p.scores[pos] ?? DEFAULT_SCORE);
                    const unrated =
                      p.scores[pos] === undefined &&
                      edits[p.id]?.[pos] === undefined;
                    return (
                      <td key={pos} className="px-3 py-2">
                        <div
                          className={`mx-auto flex w-fit items-center rounded-md border ${
                            changed ? "border-emerald-400 bg-emerald-50" : ""
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setScore(p, pos, value - 1)}
                            disabled={value <= 1}
                            className="flex h-7 w-7 items-center justify-center rounded-l-md border-r hover:bg-muted disabled:opacity-40"
                          >
                            -
                          </button>
                          <div
                            className={`flex h-7 min-w-[2rem] items-center justify-center text-xs font-semibold ${
                              unrated ? "text-muted-foreground" : ""
                            }`}
                            title={unrated ? "Unrated (default)" : undefined}
                          >
                            {value}
                          </div>
                          <button
                            type="button"
                            onClick={() => setScore(p, pos, value + 1)}
                            disabled={value >= 10}
                            className="flex h-7 w-7 items-center justify-center rounded-r-md border-l hover:bg-muted disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={POSITIONS.length + 1}
                    className="px-3 py-6 text-center text-muted-foreground"
                  >
                    No players match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
