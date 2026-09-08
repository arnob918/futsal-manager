// app/admin/teams/TeamBuilder.tsx
"use client";

import * as React from "react";
import { saveTeams } from "@/app/(actions)/teamActions";
import {
  generateTeams,
  DEFAULT_SCORE,
  type AssignedPlayer,
  type PlayerInput,
  type Position,
} from "@/lib/teams";

type MatchRow = {
  id: string;
  date: string; // ISO
  location: string | null;
  participants: {
    userId: string;
    team: "A" | "B" | null;
    position: Position | null;
  }[];
};

type PlayerRow = {
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

function toInput(p: PlayerRow): PlayerInput {
  return {
    id: p.id,
    name: p.name ?? p.email ?? "Player",
    scores: {
      GOALKEEPER: p.scores.GOALKEEPER ?? DEFAULT_SCORE,
      DEFENDER: p.scores.DEFENDER ?? DEFAULT_SCORE,
      MIDFIELDER: p.scores.MIDFIELDER ?? DEFAULT_SCORE,
      FORWARD: p.scores.FORWARD ?? DEFAULT_SCORE,
    },
  };
}

export default function TeamBuilder({
  matches,
  players,
}: {
  matches: MatchRow[];
  players: PlayerRow[];
}) {
  const [matchId, setMatchId] = React.useState(matches[0]?.id ?? "");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [teamA, setTeamA] = React.useState<AssignedPlayer[]>([]);
  const [teamB, setTeamB] = React.useState<AssignedPlayer[]>([]);
  const [swapPick, setSwapPick] = React.useState<{
    team: "A" | "B";
    index: number;
  } | null>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const playerById = React.useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players]
  );

  // When the chosen match already has saved teams, load them; otherwise
  // pre-select its participants (if any).
  React.useEffect(() => {
    const match = matches.find((m) => m.id === matchId);
    setTeamA([]);
    setTeamB([]);
    setSwapPick(null);
    setSuccess("");
    setError("");
    if (!match) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(match.participants.map((p) => p.userId)));
    const saved = match.participants.filter((p) => p.team);
    if (saved.length > 0) {
      const build = (team: "A" | "B") =>
        saved
          .filter((p) => p.team === team)
          .flatMap((p) => {
            const row = playerById.get(p.userId);
            if (!row) return [];
            const input = toInput(row);
            const position: Position = p.position ?? "MIDFIELDER";
            return [{ ...input, position, value: input.scores[position] }];
          });
      setTeamA(build("A"));
      setTeamB(build("B"));
    }
  }, [matchId, matches, playerById]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) =>
      `${p.name ?? ""} ${p.email ?? ""}`.toLowerCase().includes(q)
    );
  }, [players, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function generate() {
    setError("");
    setSuccess("");
    setSwapPick(null);
    try {
      if (selected.size < 4)
        throw new Error("Select at least 4 players (16 for a full match).");
      const pool = Array.from(selected).map((id) =>
        toInput(playerById.get(id)!)
      );
      const result = generateTeams(pool);
      setTeamA(result.teamA);
      setTeamB(result.teamB);
    } catch (e: any) {
      setError(e?.message || "Failed to generate teams.");
    }
  }

  function pickForSwap(team: "A" | "B", index: number) {
    setSuccess("");
    if (!swapPick) {
      setSwapPick({ team, index });
      return;
    }
    if (swapPick.team === team) {
      // same column: move the selection
      setSwapPick(swapPick.index === index ? null : { team, index });
      return;
    }
    // cross-team: swap the two players
    const a = [...teamA];
    const b = [...teamB];
    const [ai, bi] =
      team === "B" ? [swapPick.index, index] : [index, swapPick.index];
    const tmp = a[ai];
    a[ai] = b[bi];
    b[bi] = tmp;
    setTeamA(a);
    setTeamB(b);
    setSwapPick(null);
  }

  async function handleSave() {
    setError("");
    setSuccess("");
    setPending(true);
    try {
      if (!matchId) throw new Error("Choose a match.");
      if (teamA.length === 0 || teamB.length === 0)
        throw new Error("Generate teams first.");
      const assignments = [
        ...teamA.map((p) => ({
          userId: p.id,
          team: "A" as const,
          position: p.position,
        })),
        ...teamB.map((p) => ({
          userId: p.id,
          team: "B" as const,
          position: p.position,
        })),
      ];
      await saveTeams(matchId, assignments);
      setSuccess("Teams saved to match.");
    } catch (e: any) {
      setError(e?.message || "Failed to save teams.");
    } finally {
      setPending(false);
    }
  }

  const totalA = teamA.reduce((acc, p) => acc + p.value, 0);
  const totalB = teamB.reduce((acc, p) => acc + p.value, 0);
  const generated = teamA.length > 0;

  return (
    <div className="mt-10 flex justify-center px-3">
      <div className="w-full max-w-5xl space-y-5">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">
            Team Builder
          </h1>
          <p className="text-sm text-muted-foreground">
            Pick the players for a match and generate two balanced teams — one
            goalkeeper each, strengths evened out from the player ratings.
          </p>
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

        <div className="rounded-xl border p-4 sm:p-6 space-y-4">
          {/* Match */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Match (unsettled)</span>
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {prettyDate(new Date(m.date))}
                  {m.location ? ` – ${m.location}` : ""}
                </option>
              ))}
            </select>
            {matches.length === 0 && (
              <span className="text-xs text-muted-foreground">
                No unsettled matches — create one first.
              </span>
            )}
          </label>

          {/* Player picker */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Players ({selected.size} selected
                {selected.size % 2 === 1 ? ", odd count — teams will differ by one" : ""}
                )
              </span>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Clear
              </button>
            </div>
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              placeholder="Type name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => {
                const checked = selected.has(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-center rounded-lg border p-2 text-sm transition hover:shadow-sm ${
                      checked ? "border-emerald-300 bg-emerald-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(p.id)}
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <span className="font-medium">
                        {p.name ?? p.email ?? "Player"}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {p.email}
                      </span>
                    </div>
                  </label>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No players match your search.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={generate}
              disabled={selected.size < 4}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {generated ? "Regenerate" : "Generate teams"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={pending || !generated}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save teams"}
            </button>
          </div>
        </div>

        {/* Generated teams */}
        {generated && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Tap a player on each side to swap them between teams.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TeamColumn
                title="Team A"
                players={teamA}
                total={totalA}
                pick={swapPick?.team === "A" ? swapPick.index : null}
                onPick={(i) => pickForSwap("A", i)}
              />
              <TeamColumn
                title="Team B"
                players={teamB}
                total={totalB}
                pick={swapPick?.team === "B" ? swapPick.index : null}
                onPick={(i) => pickForSwap("B", i)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TeamColumn({
  title,
  players,
  total,
  pick,
  onPick,
}: {
  title: string;
  players: AssignedPlayer[];
  total: number;
  pick: number | null;
  onPick: (index: number) => void;
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">
          Strength: <strong>{total}</strong>
        </span>
      </div>
      <ul className="space-y-1.5">
        {players.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onPick(i)}
              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition hover:bg-muted ${
                pick === i ? "border-emerald-400 bg-emerald-50" : ""
              }`}
            >
              <span className="font-medium">{p.name}</span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5 font-semibold">
                  {POSITION_LABELS[p.position]}
                </span>
                {p.value}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
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
