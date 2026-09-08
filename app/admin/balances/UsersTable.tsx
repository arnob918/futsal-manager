"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { sendNegativeBalanceEmailAction } from "@/app/(actions)/emailActions";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  balance: number;
  participations: any[];
  transactions: any[];
};

type SortField = "name" | "email" | "matches" | "transactions" | "balance";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "name:asc", label: "Name (A–Z)" },
  { value: "name:desc", label: "Name (Z–A)" },
  { value: "balance:asc", label: "Balance (low → high)" },
  { value: "balance:desc", label: "Balance (high → low)" },
  { value: "matches:desc", label: "Most matches" },
  { value: "transactions:desc", label: "Most transactions" },
];

export default function UsersTable({ initialUsers }: { initialUsers: User[] }) {
  const [query, setQuery] = React.useState("");
  const [sortField, setSortField] = React.useState<SortField>("name");
  const [sortDir, setSortDir] = React.useState<SortDir>("asc");

  // Filter and sort users
  const users = React.useMemo(() => {
    let filtered = [...initialUsers];

    // Apply search filter
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        (u) =>
          (u.name?.toLowerCase() || "").includes(q) ||
          (u.email?.toLowerCase() || "").includes(q)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortField) {
        case "name":
          return (
            dir *
            (a.name || a.email || "").localeCompare(b.name || b.email || "")
          );
        case "email":
          return dir * (a.email || "").localeCompare(b.email || "");
        case "matches":
          return dir * (a.participations.length - b.participations.length);
        case "transactions":
          return dir * (a.transactions.length - b.transactions.length);
        case "balance":
          return dir * ((a.balance ?? 0) - (b.balance ?? 0));
        default:
          return 0;
      }
    });

    return filtered;
  }, [initialUsers, query, sortField, sortDir]);

  // Toggle sort
  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  return (
    <div className="space-y-4">
      {/* Search + count. Stacks on phones so neither element gets squeezed. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            // text-base avoids iOS Safari zooming the page on focus
            className="h-11 w-full rounded-lg border bg-background px-3 py-2 pl-9 text-base sm:h-10 sm:text-sm"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-sm text-muted-foreground">
            {users.length} {users.length === 1 ? "member" : "members"}
          </span>
          {/* The sortable table headers are hidden on mobile, so offer sorting here. */}
          <select
            aria-label="Sort members"
            value={`${sortField}:${sortDir}`}
            onChange={(e) => {
              const [f, d] = e.target.value.split(":");
              setSortField(f as SortField);
              setSortDir(d as SortDir);
            }}
            className="h-11 rounded-lg border bg-background px-2 text-sm md:hidden"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile: cards. A 6-column table is unusable at 375px. */}
      <div className="space-y-2 md:hidden">
        {users.map((user) => {
          const negative = (user.balance ?? 0) < 0;
          return (
            <div key={user.id} className="rounded-lg border p-3">
              <div className="flex items-start gap-3">
                <MemberAvatar user={user} />
                <Link
                  href={`/admin/balances/${user.id}`}
                  className="min-w-0 flex-1"
                >
                  <div className="truncate font-medium">
                    {user.name ?? "Unnamed"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user.email ?? "—"}
                  </div>
                </Link>
                {negative && <SendReminderButton userId={user.id} />}
              </div>

              <div className="mt-3 flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                <span>{user.participations.length} matches</span>
                <span>{user.transactions.length} txns</span>
                <span
                  className={
                    negative
                      ? "font-medium text-rose-600"
                      : "font-medium text-foreground"
                  }
                >
                  {formatBDT(user.balance ?? 0)}
                </span>
              </div>
            </div>
          );
        })}

        {users.length === 0 && (
          <p className="rounded-lg border py-6 text-center text-sm text-muted-foreground">
            No members found.
          </p>
        )}
      </div>

      {/* Desktop: full table */}
      <div className="hidden rounded-lg border md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <SortHeader
                  field="name"
                  current={sortField}
                  dir={sortDir}
                  onSort={toggleSort}
                >
                  Member
                </SortHeader>
                <SortHeader
                  field="email"
                  current={sortField}
                  dir={sortDir}
                  onSort={toggleSort}
                >
                  Email
                </SortHeader>
                <SortHeader
                  field="matches"
                  current={sortField}
                  dir={sortDir}
                  onSort={toggleSort}
                  align="right"
                >
                  Matches
                </SortHeader>
                <SortHeader
                  field="transactions"
                  current={sortField}
                  dir={sortDir}
                  onSort={toggleSort}
                  align="right"
                >
                  Transactions
                </SortHeader>
                <SortHeader
                  field="balance"
                  current={sortField}
                  dir={sortDir}
                  onSort={toggleSort}
                  align="right"
                >
                  Balance
                </SortHeader>
                <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-3 px-4">
                    <Link href={`/admin/balances/${user.id}`}>
                      <div className="flex items-center gap-3">
                        <MemberAvatar user={user} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">
                            {user.name ?? "Unnamed"}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {user.email ?? "—"}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                    {user.participations.length}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                    {user.transactions.length}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-medium ${
                        (user.balance ?? 0) < 0 ? "text-rose-600" : ""
                      }`}
                    >
                      {formatBDT(user.balance ?? 0)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {(user.balance ?? 0) < 0 && (
                      <SendReminderButton userId={user.id} />
                    )}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 text-center text-sm text-muted-foreground"
                  >
                    No members found.
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

function MemberAvatar({ user }: { user: User }) {
  if (user.image) {
    return (
      <Image
        src={user.image}
        alt={user.name ?? user.email ?? "User"}
        width={32}
        height={32}
        className="size-8 shrink-0 rounded-full"
      />
    );
  }
  return (
    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">
      {(user.name || user.email || "?")
        .split(" ")
        .map((s) => s?.[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()}
    </div>
  );
}

function SortHeader({
  field,
  current,
  dir,
  onSort,
  children,
  align = "left",
}: {
  field: SortField;
  current: SortField;
  dir: SortDir;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const active = current === field;
  return (
    <th
      className={`py-3 px-4 text-sm font-medium text-muted-foreground ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {children}
        <span className="text-xs">
          {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`size-4 ${className}`}
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function formatBDT(n: number) {
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

function SendReminderButton({ userId }: { userId: string }) {
  const [isSending, setIsSending] = React.useState(false);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const result = await sendNegativeBalanceEmailAction([userId]);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={isSending}
      title="Send Reminder Email"
      aria-label="Send reminder email"
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-rose-600 md:size-8"
    >
      {isSending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Mail className="size-4" />
      )}
    </button>
  );
}
