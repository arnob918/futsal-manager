// app/(dashboard)/matches/MatchesView.tsx
"use client";

import * as React from "react";

type User = {
  id: string;
  name: string | null;
  image?: string | null;
};

type Participant = {
  id: string;
  userId: string;
  user: User;
};

type Match = {
  id: string;
  date: string; // ISO string (serialized from server)
  location?: string | null;
  totalCost?: number | null; // if you store plain number
  totalCostCents?: number | null; // if you store cents
  settled: boolean;
  participants: Participant[];
};

function formatTaka(amount: number | null | undefined) {
  if (amount == null) return "—";
  try {
    // tweak if you want USD/etc.
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount}৳`;
  }
}

function extractYMD(d: Date) {
  return { y: d.getFullYear(), m: d.getMonth() + 1, day: d.getDate() };
}

function getInitials(name?: string | null) {
  if (!name) return "🤝";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase() || "🤝";
}

function prettyDateTime(d: Date) {
  const datePart = new Intl.DateTimeFormat("en-BD", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
  const timePart = new Intl.DateTimeFormat("en-BD", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${datePart} • ${timePart}`;
}

export default function MatchesView({
  initialMatches,
}: {
  initialMatches: Match[];
}) {
  const allMatches = React.useMemo(
    () =>
      initialMatches.map((m) => ({
        ...m,
        _date: new Date(m.date),
      })),
    [initialMatches]
  );

  // Build filter value sets
  const allYears = React.useMemo(
    () =>
      Array.from(new Set(allMatches.map((m) => m._date.getFullYear()))).sort(
        (a, b) => b - a
      ),
    [allMatches]
  );

  const [year, setYear] = React.useState<number | "all">("all");
  const [month, setMonth] = React.useState<number | "all">("all");
  const [day, setDay] = React.useState<number | "all">("all");

  const monthsForYear = React.useMemo(() => {
    const filtered =
      year === "all"
        ? allMatches
        : allMatches.filter((m) => m._date.getFullYear() === year);
    return Array.from(
      new Set(filtered.map((m) => m._date.getMonth() + 1))
    ).sort((a, b) => a - b);
  }, [allMatches, year]);

  const daysForYearMonth = React.useMemo(() => {
    const filtered =
      year === "all"
        ? allMatches
        : allMatches.filter((m) => m._date.getFullYear() === year);
    const filtered2 =
      month === "all"
        ? filtered
        : filtered.filter((m) => m._date.getMonth() + 1 === month);
    return Array.from(new Set(filtered2.map((m) => m._date.getDate()))).sort(
      (a, b) => a - b
    );
  }, [allMatches, year, month]);

  const filtered = React.useMemo(() => {
    return allMatches.filter((m) => {
      const { y, m: mon, day: dd } = extractYMD(m._date);
      if (year !== "all" && y !== year) return false;
      if (month !== "all" && mon !== month) return false;
      if (day !== "all" && dd !== day) return false;
      return true;
    });
  }, [allMatches, year, month, day]);

  // Split Upcoming vs Past
  const now = new Date();
  const upcoming = React.useMemo(
    () =>
      filtered
        .filter((m) => m._date >= now)
        .sort((a, b) => +a._date - +b._date),
    [filtered, now]
  );

  const past = React.useMemo(
    () =>
      filtered.filter((m) => m._date < now).sort((a, b) => +b._date - +a._date),
    [filtered, now]
  );

  function clearFilters() {
    setYear("all");
    setMonth("all");
    setDay("all");
  }

  return (
    <div className="space-y-4 mt-12">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Matches</h1>
          <p className="text-sm text-muted-foreground">
            Browse upcoming and past matches. Use the filters to find by date.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
            <span className="size-2 rounded-full bg-emerald-500" />
            Upcoming: {upcoming.length}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
            <span className="size-2 rounded-full bg-slate-400" />
            Past: {past.length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 -mx-3 rounded-b-lg border-b bg-background/80 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:mx-0 sm:rounded-lg sm:border">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {/* Year */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Year
            </span>
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={year}
              onChange={(e) =>
                setYear(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
            >
              <option value="all">All</option>
              {allYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          {/* Month */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Month
            </span>
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={month}
              onChange={(e) =>
                setMonth(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              disabled={year === "all"}
            >
              <option value="all">All</option>
              {monthsForYear.map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleString("en-GB", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </label>

          {/* Day */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Day
            </span>
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={day}
              onChange={(e) =>
                setDay(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              disabled={year === "all" || month === "all"}
            >
              <option value="all">All</option>
              {daysForYearMonth.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          {/* Clear */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
              type="button"
              title="Clear filters"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Sections */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming matches found.
          </p>
        ) : (
          <CardGrid matches={upcoming} />
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="size-2 rounded-full bg-slate-400" />
          Past
        </h2>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No past matches found.
          </p>
        ) : (
          <CardGrid matches={past} />
        )}
      </section>
    </div>
  );
}

function CardGrid({ matches }: { matches: (Match & { _date: Date })[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((m) => (
        <article
          key={m.id}
          className="group rounded-xl border p-3 transition hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold">
                {prettyDateTime(m._date)}
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                {m.location ? m.location : "—"}
              </div>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs ${
                m.settled
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
              title={m.settled ? "Settled" : "Not settled yet"}
            >
              <span
                className={`size-1.5 rounded-full ${
                  m.settled ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {m.settled ? "Settled" : "Unsettled"}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">Total: </span>
              <strong>
                {m.totalCostCents != null
                  ? formatTaka(Math.round(m.totalCostCents / 100))
                  : formatTaka(m.totalCost ?? 0)}
              </strong>
            </div>
          </div>

          {/* Participants */}
          <div className="mt-3 flex flex-wrap gap-2">
            {m.participants.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs"
                title={p.user?.name ?? "Player"}
              >
                <div className="grid size-5 place-items-center rounded-full bg-muted text-[10px] font-bold">
                  {getInitials(p.user?.name)}
                </div>
                <span className="max-w-[10rem] truncate">
                  {p.user?.name ?? "Player"}
                </span>
              </div>
            ))}
            {m.participants.length > 6 && (
              <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs text-muted-foreground">
                +{m.participants.length - 6} more
              </span>
            )}
          </div>

          {/* Hover affordance */}
          <div className="pointer-events-none mt-3 h-1 rounded bg-gradient-to-r from-transparent via-muted to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </article>
      ))}
    </div>
  );
}
