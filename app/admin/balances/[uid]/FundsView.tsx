// app/(dashboard)/funds/FundsView.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";
type FundRequest = {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  note: string | null;
  createdAt: string; // ISO
};

type Transaction = {
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

export default function FundsView({
  initialRequests,
  initialTransactions,
  userName = "User",
  userBalance = 0,
}: {
  initialRequests: FundRequest[];
  initialTransactions: Transaction[];
  userName?: string;
  userBalance?: number;
}) {
  return (
    <div className="mt-12 mb-12 flex flex-col items-center">
      <div className="space-y-5 max-w-5xl w-full">
        {/* Balance Card */}
        <h2 className="text-xl font-semibold my-2">
          {userName}'s Transaction History
        </h2>
        <div
          className={`bg-gradient-to-br ${
            userBalance < 0
              ? "from-rose-400 to-rose-500"
              : "from-emerald-500 to-emerald-600"
          } rounded-2xl shadow-lg p-6 md:p-8 text-white`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">
                Current Balance
              </p>
              <p className="text-4xl md:text-5xl font-bold">
                {userBalance ?? 0} BDT
              </p>
            </div>
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Transaction Ledger */}
        <section className="space-y-4">
          {initialTransactions.length === 0 && initialRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transaction history yet.
            </p>
          ) : (
            <div className="hidden md:block overflow-x-auto rounded-xl border">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium  uppercase tracking-wider text-amber-600"
                    >
                      Request
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium  uppercase tracking-wider text-green-600"
                    >
                      Credit
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium  uppercase tracking-wider text-red-600"
                    >
                      Debit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Combine and sort transactions and requests by date */}
                  {[
                    ...initialTransactions.map((t) => ({
                      id: t.id,
                      date: new Date(t.createdAt),
                      description: getTransactionDescription(t),
                      amount: t.amount,
                      isTransaction: true,
                      status: null,
                      item: t,
                    })),
                    ...initialRequests.map((r) => ({
                      id: r.id,
                      date: new Date(r.createdAt),
                      description: r.note || "Fund request",
                      amount: r.amount,
                      isTransaction: false,
                      status: r.status,
                      item: r,
                    })),
                  ]
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((item, index) => (
                      <tr
                        key={item.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                          {prettyDateTime(item.date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-amber-600">
                          {!item.isTransaction ? formatTaka(item.amount) : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-green-600">
                          {item.isTransaction && item.amount > 0
                            ? formatTaka(item.amount)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-red-600">
                          {item.isTransaction && item.amount < 0
                            ? formatTaka(Math.abs(item.amount))
                            : "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile View - Card-based ledger for small screens */}
          <div className="md:hidden space-y-3 mt-4">
            {[
              ...initialTransactions.map((t) => ({
                id: t.id,
                date: new Date(t.createdAt),
                description: getTransactionDescription(t),
                amount: t.amount,
                isTransaction: true,
                status: null,
                item: t,
              })),
              ...initialRequests.map((r) => ({
                id: r.id,
                date: new Date(r.createdAt),
                description: r.note || "Fund request",
                amount: r.amount,
                isTransaction: false,
                status: r.status,
                item: r,
              })),
            ]
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map((item) => (
                <article key={item.id} className="rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-semibold ${
                          !item.isTransaction
                            ? "text-amber-600"
                            : item.amount > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatTaka(item.amount)}
                      </div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                    <div>
                      {item.isTransaction ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.amount > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.amount > 0 ? "Credit" : "Debit"}
                        </span>
                      ) : (
                        <StatusPill status={item.status} />
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {prettyDateTime(item.date)}
                  </div>
                </article>
              ))}
          </div>
        </section>
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

function StatusPill({
  status,
}: {
  status: "PENDING" | "APPROVED" | "REJECTED" | null;
}) {
  const map = {
    PENDING: {
      cls: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      label: "Pending",
    },
    APPROVED: {
      cls: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      label: "Approved",
    },
    REJECTED: {
      cls: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      label: "Rejected",
    },
  } as const;

  const s = map[status || "PENDING"];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs ${s.cls}`}
    >
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function prettyDateTime(d: Date) {
  const datePart = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
  const timePart = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
  return `${datePart} • ${timePart}`;
}

function formatTaka(amount: number) {
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)}৳`;
  }
}

function getTransactionDescription(transaction: Transaction): string {
  switch (transaction.kind) {
    case "FUND_TOPUP":
      return transaction.memo || "Fund added to account";
    case "MATCH_PAYER_CREDIT":
      return transaction.match
        ? `Credit for match on ${formatDate(new Date(transaction.match.date))}${
            transaction.match.location
              ? ` at ${transaction.match.location}`
              : ""
          }`
        : "Match payment credit";
    case "MATCH_PARTICIPANT_DEBIT":
      return transaction.match
        ? `Match fee for ${formatDate(new Date(transaction.match.date))}${
            transaction.match.location
              ? ` at ${transaction.match.location}`
              : ""
          }`
        : "Match participation fee";
    default:
      return transaction.memo || "Transaction";
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
