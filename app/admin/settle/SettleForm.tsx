// app/(dashboard)/settle/SettleForm.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Money } from "@/components/Money";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { prettyDateTime } from "@/lib/format";

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

  // Filter users by search query (name/email)
  const filteredUsers = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const key = `${u.name ?? ""} ${u.email ?? ""}`.toLowerCase();
      return key.includes(q);
    });
  }, [users, query]);

  const [guests, setGuests] = React.useState<Record<string, number>>({});

  // Per-head split
  const count = selected.size;
  const totalGuests = Array.from(selected).reduce(
    (acc, id) => acc + (guests[id] || 0),
    0
  );
  const totalHeads = count + totalGuests;
  const totalNum = Number(totalBDT);
  const perHead =
    Number.isFinite(totalNum) && totalNum > 0 && totalHeads > 0
      ? Math.round((totalNum / totalHeads) * 100) / 100
      : 0;

  function toggleUser(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // clear guests if deselected
        setGuests((g) => {
          const newG = { ...g };
          delete newG[id];
          return newG;
        });
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function updateGuests(id: string, num: number) {
    if (num < 0) return;
    setGuests((prev) => ({ ...prev, [id]: num }));
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
    setGuests({});
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      // Guard client-side
      if (!matchId) throw new Error("Please choose a match.");
      if (!Number.isFinite(totalNum) || totalNum <= 0)
        throw new Error("Enter a valid total amount (BDT).");
      if (!count) throw new Error("Select at least one participant.");

      // Create a new FormData to avoid duplicate entries
      const cleanFormData = new FormData();

      // Copy over non-participant form fields
      for (const [key, value] of formData.entries()) {
        if (key !== "participants") {
          cleanFormData.append(key, value);
        }
      }

      // Prepare participants data
      const participantsData = Array.from(selected).map((id) => ({
        userId: id,
        guests: guests[id] || 0,
      }));
      cleanFormData.set("participantsData", JSON.stringify(participantsData));
      cleanFormData.set("matchId", matchId);

      const res = await action(cleanFormData);
      if (!res || (res as any).ok) {
        toast.success("Match settled", {
          description: "Balances have been updated.",
        });
        // Reset + navigate to matches
        setTotalBDT("");
        setSelected(new Set());
        setGuests({});
        router.push("/admin/settle");
      }
    } catch (e: any) {
      toast.error("Couldn't settle the match", {
        description: e?.message || "Failed to settle match.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settle match"
        description="Choose a past match, select participants and confirm the total."
      />

      <Card className="relative">
        <CardContent>
          {pending && (
            <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
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
            <div className="grid gap-2">
              <Label htmlFor="matchId">Match (past)</Label>
              <Select value={matchId} onValueChange={setMatchId}>
                <SelectTrigger id="matchId" className="w-full">
                  <SelectValue placeholder="Choose a match…" />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {prettyDateTime(new Date(m.date))}
                      {m.location ? ` – ${m.location}` : ""}
                      {m.settled ? " (Settled)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only previous matches are listed (most recent first).
              </p>
            </div>

            {/* Total */}
            <div className="grid gap-2">
              <Label htmlFor="totalBDT">Total cost (BDT)</Label>
              <Input
                id="totalBDT"
                name="totalBDT"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                required
                value={totalBDT}
                onChange={(e) => setTotalBDT(e.target.value)}
                placeholder="e.g. 3600"
              />
              <p className="text-xs text-muted-foreground">
                Per head:{" "}
                <span className="font-medium text-foreground">
                  {perHead > 0 ? <Money amount={perHead} /> : "—"}
                </span>{" "}
                {count
                  ? `(${totalHeads} heads: ${count} players + ${totalGuests} guests)`
                  : ""}
              </p>
            </div>

            {/* Participant search + actions */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Label htmlFor="playerSearch">Search players</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllVisible}
                  >
                    Select shown
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <Input
                id="playerSearch"
                type="search"
                placeholder="Type name or email…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Participants grid */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((u) => {
                const checked = selected.has(u.id);
                const guestCount = guests[u.id] || 0;
                return (
                  <div
                    key={u.id}
                    className={`flex flex-col gap-2 rounded-lg border p-2 text-sm transition hover:shadow-sm ${
                      checked ? "border-primary bg-primary/10" : ""
                    }`}
                  >
                    <label className="flex cursor-pointer items-center py-1.5">
                      <input
                        type="checkbox"
                        name="participants"
                        value={u.id}
                        checked={checked}
                        onChange={() => toggleUser(u.id)}
                        className="mr-3 size-5 shrink-0 accent-primary"
                      />
                      <div className="flex-1">
                        <span className="font-medium">
                          {u.name ?? u.email ?? "Player"}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {u.email}
                        </span>
                      </div>
                    </label>
                    {checked && (
                      <div className="ml-6 flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Guests:
                        </span>
                        <div
                          className="flex items-center rounded-md border bg-background"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateGuests(u.id, Math.max(0, guestCount - 1))
                            }
                            className="flex size-7 items-center justify-center rounded-l-md border-r transition-colors hover:bg-accent disabled:opacity-50"
                            disabled={guestCount <= 0}
                            aria-label="Remove a guest"
                          >
                            <Minus className="size-3" />
                          </button>
                          <div className="flex h-7 min-w-8 items-center justify-center text-xs font-medium tabular-nums">
                            {guestCount}
                          </div>
                          <button
                            type="button"
                            onClick={() => updateGuests(u.id, guestCount + 1)}
                            className="flex size-7 items-center justify-center rounded-r-md border-l transition-colors hover:bg-accent"
                            aria-label="Add a guest"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No players match your search.
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={pending}
                className="w-full sm:w-auto"
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                {pending ? "Settling…" : "Settle match"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

