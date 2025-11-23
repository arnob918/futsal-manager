// app/(dashboard)/funds/FundsView.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BkashAccordion } from "./BkashAccordion";

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
  action,
  initialRequests,
  initialTransactions,
  channels,
}: {
  action: (formData: FormData) => Promise<{ ok: boolean } | void>;
  initialRequests: FundRequest[];
  initialTransactions: Transaction[];
  channels: string[];
}) {
  const router = useRouter();
  const [amount, setAmount] = React.useState<string>("");
  const [channel, setChannel] = React.useState<string>("");
  const [userNote, setUserNote] = React.useState<string>("");

  const [pending, setPending] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string>("");
  const [errorMsg, setErrorMsg] = React.useState<string>("");

  // client-side handler that calls the server action
  async function handleSubmit(formData: FormData) {
    setErrorMsg("");
    setSuccessMsg("");
    setPending(true);
    try {
      const res = await action(formData);
      // treat undefined as success too
      if (!res || (res as any).ok) {
        // reset inputs
        setAmount("");
        setChannel("");
        setUserNote("");
        // refresh requests list
        router.refresh();
        // show success message briefly
        setSuccessMsg("Request submitted successfully.");
        setTimeout(() => setSuccessMsg(""), 2500);
      }
    } catch (e: any) {
      setErrorMsg(e?.message || "Something went wrong while submitting.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-12 mb-12 flex flex-col items-center">
      <div className="space-y-5 max-w-5xl w-full">
        <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Add Funds</h1>
            <p className="text-sm text-muted-foreground">
              Request to add money to your balance. Amount and payment method
              are required.
            </p>
          </div>
        </header>

        {/* Alerts */}
        {successMsg && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {errorMsg}
          </div>
        )}

        {/* Form Card */}
        <div className="relative rounded-xl border p-4 sm:p-6">
          {/* Loader overlay */}
          {pending && (
            <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm">
                <Spinner />
                <span>Submitting…</span>
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(new FormData(e.currentTarget));
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {/* Amount (required) */}
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                Amount (BDT) <span className="text-red-500">*</span>
              </span>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                name="amount"
                placeholder="e.g., 1500"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="text-xs text-muted-foreground">
                Must be a positive amount.
              </span>
            </label>

            {/* Channel (required) */}
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                Payment Method <span className="text-red-500">*</span>
              </span>
              <select
                className="rounded-lg border px-3 py-2 text-sm"
                name="channel"
                required
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="" disabled>
                  Select a method…
                </option>
                {channels.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">
                Choose one: Bank, Bkash, Rocket, Nagad, or Other.
              </span>
            </label>

            {/* Optional Note */}
            <label className="col-span-1 sm:col-span-2 flex flex-col gap-1">
              <span className="text-sm font-medium">Optional note</span>
              <textarea
                className="min-h-[84px] rounded-lg border px-3 py-2 text-sm"
                name="userNote"
                placeholder="Account details, transaction ID, sender name, etc."
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
              />
            </label>

            {/* Submit */}
            <div className="col-span-1 sm:col-span-2 flex items-center justify-end gap-3 pt-1">
              <button
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                type="submit"
                disabled={pending || !amount || Number(amount) <= 0 || !channel}
                title={
                  pending
                    ? "Submitting…"
                    : !amount || Number(amount) <= 0 || !channel
                    ? "Fill required fields"
                    : "Submit request"
                }
              >
                {pending && <Spinner />}
                {pending ? "Submitting…" : "Request"}
              </button>
            </div>
          </form>
        </div>

        {/* Transaction Ledger */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">My Transaction History</h2>

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
      <BkashAccordion bkashNumber="01875782911" />
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
