"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Loader2, Mail, Search } from "lucide-react";
import { toast } from "sonner";

import { sendNegativeBalanceEmailAction } from "@/app/(actions)/emailActions";
import { Money } from "@/components/Money";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInitials } from "@/lib/format";

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
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="h-11 pl-9 sm:h-9"
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-sm text-muted-foreground">
            {users.length} {users.length === 1 ? "member" : "members"}
          </span>
          {/* The sortable table headers are hidden on mobile, so offer sorting here. */}
          <Select
            value={`${sortField}:${sortDir}`}
            onValueChange={(v) => {
              const [f, d] = v.split(":");
              setSortField(f as SortField);
              setSortDir(d as SortDir);
            }}
          >
            <SelectTrigger
              aria-label="Sort members"
              className="h-11 md:hidden"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile: cards. A 6-column table is unusable at 375px. */}
      <div className="space-y-2 md:hidden">
        {users.map((user) => {
          const negative = (user.balance ?? 0) < 0;
          return (
            <Card key={user.id} className="gap-0 py-3">
              <CardContent className="px-3">
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
                <span className="font-medium">
                  <Money amount={user.balance ?? 0} tone="sign" />
                </span>
              </div>
              </CardContent>
            </Card>
          );
        })}

        {users.length === 0 && (
          <Card>
            <CardContent>
              <p className="py-6 text-center text-sm text-muted-foreground">
                No members found.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Desktop: full table */}
      <Card className="hidden overflow-hidden py-0 md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {user.participations.length}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {user.transactions.length}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <Money amount={user.balance ?? 0} tone="sign" />
                  </TableCell>
                  <TableCell className="text-right">
                    {(user.balance ?? 0) < 0 && (
                      <SendReminderButton userId={user.id} />
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No members found.
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function MemberAvatar({ user }: { user: User }) {
  return (
    <Avatar className="size-8 shrink-0">
      {user.image && <AvatarImage src={user.image} alt="" />}
      <AvatarFallback className="text-xs">
        {getInitials(user.name ?? user.email)}
      </AvatarFallback>
    </Avatar>
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
  const Icon = !active ? ChevronsUpDown : dir === "asc" ? ArrowUp : ArrowDown;

  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-foreground ${
          active ? "text-foreground" : ""
        }`}
      >
        {children}
        <Icon className="size-3.5" />
      </button>
    </TableHead>
  );
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
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleSend}
      disabled={isSending}
      title="Send reminder email"
      aria-label="Send reminder email"
      className="size-10 shrink-0 text-destructive hover:text-destructive md:size-8"
    >
      {isSending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Mail className="size-4" />
      )}
    </Button>
  );
}
