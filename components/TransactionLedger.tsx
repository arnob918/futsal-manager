"use client";

import * as React from "react";

import { Money } from "@/components/Money";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prettyDateTime, shortDate } from "@/lib/format";

export type FundRequest = {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  createdAt: string; // ISO
};

export type Transaction = {
  id: string;
  amount: number;
  memo: string | null;
  createdAt: string; // ISO
  kind:
    | "GENERIC"
    | "FUND_TOPUP"
    | "MATCH_PAYER_CREDIT"
    | "MATCH_PARTICIPANT_DEBIT";
  matchId: string | null;
  match: {
    id: string;
    date: string;
    location: string | null;
  } | null;
};

type LedgerEntry = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  isTransaction: boolean;
  status: FundRequest["status"] | null;
};

function getTransactionDescription(t: Transaction): string {
  const where = t.match
    ? `${shortDate(new Date(t.match.date))}${t.match.location ? ` at ${t.match.location}` : ""}`
    : null;

  switch (t.kind) {
    case "FUND_TOPUP":
      return t.memo || "Fund added to account";
    case "MATCH_PAYER_CREDIT":
      return where ? `Credit for match on ${where}` : "Match payment credit";
    case "MATCH_PARTICIPANT_DEBIT":
      return where ? `Match fee for ${where}` : "Match participation fee";
    default:
      return t.memo || "Transaction";
  }
}

/** Fund requests and transactions merged into one date-ordered feed. */
export function buildLedger(
  transactions: Transaction[],
  requests: FundRequest[]
): LedgerEntry[] {
  return [
    ...transactions.map((t) => ({
      id: t.id,
      date: new Date(t.createdAt),
      description: getTransactionDescription(t),
      amount: t.amount,
      isTransaction: true,
      status: null,
    })),
    ...requests.map((r) => ({
      id: r.id,
      date: new Date(r.createdAt),
      description: r.note || "Fund request",
      amount: r.amount,
      isTransaction: false,
      status: r.status,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
}

function EntryStatus({ entry }: { entry: LedgerEntry }) {
  if (!entry.isTransaction) {
    return <StatusBadge status={entry.status ?? "PENDING"} />;
  }
  return (
    <Badge variant="secondary">{entry.amount > 0 ? "Credit" : "Debit"}</Badge>
  );
}

function EntryAmount({ entry }: { entry: LedgerEntry }) {
  return (
    <Money
      amount={entry.amount}
      tone={entry.isTransaction ? "sign" : "plain"}
      showSign={entry.isTransaction}
    />
  );
}

export function TransactionLedger({
  transactions,
  requests,
}: {
  transactions: Transaction[];
  requests: FundRequest[];
}) {
  const ledger = React.useMemo(
    () => buildLedger(transactions, requests),
    [transactions, requests]
  );

  if (ledger.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No transaction history yet.
      </p>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledger.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {prettyDateTime(entry.date)}
                </TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell className="text-right">
                  <EntryStatus entry={entry} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  <EntryAmount entry={entry} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile rows — a 4-column table is unusable at 375px. */}
      <ul className="divide-y md:hidden">
        {ledger.map((entry) => (
          <li
            key={entry.id}
            className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0 space-y-1">
              <p className="line-clamp-2 text-sm">{entry.description}</p>
              <p className="text-xs text-muted-foreground">
                {prettyDateTime(entry.date)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <span className="text-sm font-medium">
                <EntryAmount entry={entry} />
              </span>
              <EntryStatus entry={entry} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
