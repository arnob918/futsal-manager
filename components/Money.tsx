import { formatTaka } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Currency figure with tabular numerals so columns of amounts line up.
 * `tone="sign"` colors negatives destructive and positives success; the
 * default leaves the amount in the surrounding text color.
 */
export function Money({
  amount,
  tone = "plain",
  showSign = false,
  className,
}: {
  amount: number | null | undefined;
  tone?: "plain" | "sign";
  showSign?: boolean;
  className?: string;
}) {
  const value = amount ?? 0;
  const formatted = formatTaka(Math.abs(value));
  const prefix = value < 0 ? "−" : showSign && value > 0 ? "+" : "";

  return (
    <span
      className={cn(
        "tabular-nums",
        tone === "sign" && value < 0 && "text-destructive",
        tone === "sign" && value > 0 && "text-success",
        className
      )}
    >
      {prefix}
      {formatted}
    </span>
  );
}
