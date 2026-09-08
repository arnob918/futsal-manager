/**
 * Shared formatting helpers. These started as file-locals in
 * app/matches/MatchView.tsx and were re-derived ad hoc in the dashboard, funds
 * and admin screens; keep the single copy here.
 */

export function formatTaka(amount: number | null | undefined) {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount}৳`;
  }
}

export function getInitials(name?: string | null) {
  if (!name) return "🤝";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase() || "🤝";
}

export function prettyDateTime(d: Date) {
  const datePart = new Intl.DateTimeFormat("en-BD", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);

  const timePart = new Intl.DateTimeFormat("en-BD", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);

  return `${datePart} • ${timePart}`;
}

export function shortDateTime(d: Date) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function shortDate(d: Date) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Match dates are stored without a real zone; read them as local wall time. */
export function parseAsLocalDate(isoString: string): Date {
  const cleanStr = isoString.replace(/Z$/, "").replace(/[+-]\d{2}:\d{2}$/, "");
  return new Date(cleanStr);
}
