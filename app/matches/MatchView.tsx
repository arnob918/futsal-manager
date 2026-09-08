// app/(dashboard)/matches/MatchesView.tsx
"use client";

import * as React from "react";

import { Money } from "@/components/Money";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials, parseAsLocalDate, prettyDateTime } from "@/lib/format";

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

type DatedMatch = Match & { _date: Date };

const ALL = "all";

function FilterSelect({
  label,
  value,
  onChange,
  disabled,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  options: { value: string; label: string }[];
}) {
  const id = React.useId();

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function MatchGrid({ matches }: { matches: DatedMatch[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((m) => {
        const total =
          m.totalCostCents != null
            ? Math.round(m.totalCostCents / 100)
            : (m.totalCost ?? 0);
        const shown = m.participants.slice(0, 6);
        const overflow = m.participants.length - shown.length;

        return (
          <Card key={m.id} className="transition-colors hover:border-primary/40">
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{prettyDateTime(m._date)}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                    {m.location || "—"}
                  </p>
                </div>
                <StatusBadge
                  status={m.settled ? "SETTLED" : "PENDING"}
                  label={m.settled ? "Settled" : "Unsettled"}
                />
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Total: </span>
                <span className="font-medium">
                  <Money amount={total} />
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {shown.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2 text-xs"
                    title={p.user?.name ?? "Player"}
                  >
                    <Avatar className="size-5">
                      <AvatarFallback className="text-[9px] font-semibold">
                        {getInitials(p.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[9rem] truncate">
                      {p.user?.name ?? "Player"}
                    </span>
                  </span>
                ))}
                {overflow > 0 && (
                  <Badge variant="secondary">+{overflow} more</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function MatchesView({
  initialMatches,
}: {
  initialMatches: Match[];
}) {
  const allMatches = React.useMemo(
    () =>
      initialMatches.map((m) => ({ ...m, _date: parseAsLocalDate(m.date) })),
    [initialMatches]
  );

  const allYears = React.useMemo(
    () =>
      Array.from(new Set(allMatches.map((m) => m._date.getFullYear()))).sort(
        (a, b) => b - a
      ),
    [allMatches]
  );

  const [year, setYear] = React.useState<string>(ALL);
  const [month, setMonth] = React.useState<string>(ALL);
  const [day, setDay] = React.useState<string>(ALL);

  const byYear = React.useMemo(
    () =>
      year === ALL
        ? allMatches
        : allMatches.filter((m) => String(m._date.getFullYear()) === year),
    [allMatches, year]
  );

  const monthsForYear = React.useMemo(
    () =>
      Array.from(new Set(byYear.map((m) => m._date.getMonth() + 1))).sort(
        (a, b) => a - b
      ),
    [byYear]
  );

  const daysForYearMonth = React.useMemo(() => {
    const scoped =
      month === ALL
        ? byYear
        : byYear.filter((m) => String(m._date.getMonth() + 1) === month);
    return Array.from(new Set(scoped.map((m) => m._date.getDate()))).sort(
      (a, b) => a - b
    );
  }, [byYear, month]);

  const filtered = React.useMemo(
    () =>
      byYear.filter((m) => {
        if (month !== ALL && String(m._date.getMonth() + 1) !== month)
          return false;
        if (day !== ALL && String(m._date.getDate()) !== day) return false;
        return true;
      }),
    [byYear, month, day]
  );

  // Computed once per render pass rather than inside each memo, so the memo
  // dependencies don't change on every render.
  const nowTs = React.useMemo(() => Date.now(), []);

  const upcoming = React.useMemo(
    () =>
      filtered.filter((m) => +m._date >= nowTs).sort((a, b) => +a._date - +b._date),
    [filtered, nowTs]
  );

  const past = React.useMemo(
    () =>
      filtered.filter((m) => +m._date < nowTs).sort((a, b) => +b._date - +a._date),
    [filtered, nowTs]
  );

  function clearFilters() {
    setYear(ALL);
    setMonth(ALL);
    setDay(ALL);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matches"
        description="Browse upcoming and past matches. Use the filters to find by date."
        actions={
          <>
            <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
              Upcoming: {upcoming.length}
            </Badge>
            <Badge variant="secondary">Past: {past.length}</Badge>
          </>
        }
      />

      <Card>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FilterSelect
              label="Year"
              value={year}
              onChange={(v) => {
                setYear(v);
                setMonth(ALL);
                setDay(ALL);
              }}
              options={allYears.map((y) => ({
                value: String(y),
                label: String(y),
              }))}
            />
            <FilterSelect
              label="Month"
              value={month}
              disabled={year === ALL}
              onChange={(v) => {
                setMonth(v);
                setDay(ALL);
              }}
              options={monthsForYear.map((m) => ({
                value: String(m),
                label: new Date(2000, m - 1, 1).toLocaleString("en-GB", {
                  month: "long",
                }),
              }))}
            />
            <FilterSelect
              label="Day"
              value={day}
              disabled={year === ALL || month === ALL}
              onChange={setDay}
              options={daysForYearMonth.map((d) => ({
                value: String(d),
                label: String(d),
              }))}
            />
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming matches found.
          </p>
        ) : (
          <MatchGrid matches={upcoming} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Past</h2>
        {past.length === 0 ? (
          <p className="text-sm text-muted-foreground">No past matches found.</p>
        ) : (
          <MatchGrid matches={past} />
        )}
      </section>
    </div>
  );
}
