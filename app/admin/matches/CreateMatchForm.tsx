"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function CreateMatchForm({
  action,
}: {
  action: (formData: FormData) => Promise<{ ok: boolean }>;
}) {
  const router = useRouter();

  // form state
  const [date, setDate] = React.useState<string>(() =>
    toLocalDatetimeInputValue(addHours(new Date(), 2))
  );
  const [location, setLocation] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<string>("");

  const minDateStr = toLocalDatetimeInputValue(new Date());

  // submit handler wraps the server action to show loader + UX
  async function handleSubmit(formData: FormData) {
    setError("");
    setSuccess("");
    setPending(true);
    try {
      // basic client guards
      const dt = new Date(formData.get("date") as string);

      const res = await action(formData);
      if (!res || (res as any).ok) {
        setSuccess("Match created!");
        // Option A: navigate to list
        router.push("/admin/matches");
        // Option B (instead): stay here & clear form
        // setLocation(""); setDate(toLocalDatetimeInputValue(addHours(new Date(), 2)));
        // router.refresh();
      }
    } catch (e: any) {
      setError(e?.message || "Failed to create match.");
    } finally {
      setPending(false);
    }
  }

  // Quick-fill helpers
  function setTonight() {
    setDate(toLocalDatetimeInputValue(addHours(new Date(), 2)));
  }
  function setTomorrow8pm() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(20, 0, 0, 0);
    setDate(toLocalDatetimeInputValue(d));
  }

  return (
    <div className="mt-12 flex justify-center px-3">
      <div className="w-full max-w-xl space-y-5">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">New Match</h1>
          <p className="text-sm text-muted-foreground">
            Pick a date/time and (optionally) add a location.
          </p>
        </header>

        {/* Alerts */}
        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {error}
          </div>
        )}

        <div className="relative rounded-xl border p-4 sm:p-6">
          {/* Loader overlay */}
          {pending && (
            <div className="absolute inset-0 z-50 grid place-items-center rounded-xl bg-background/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm">
                <Spinner />
                <span>Creating match…</span>
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
            {/* DateTime */}
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">
                Date &amp; time <span className="text-red-500">*</span>
              </span>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                type="datetime-local"
                name="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <Chip onClick={setTonight}>Tonight (+2h)</Chip>
                <Chip onClick={setTomorrow8pm}>Tomorrow 8:00 PM</Chip>
              </div>
            </label>

            {/* Location */}
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Location (optional)</span>
              <input
                className="rounded-lg border px-3 py-2 text-sm"
                name="location"
                placeholder="e.g., Sports Arena"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                // keep native constraint attrs too (server reads it anyway)
                maxLength={120}
              />
            </label>

            {/* Submit */}
            <div className="flex items-center justify-end">
              <button
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                type="submit"
                disabled={pending || !date}
                title={pending ? "Creating…" : "Create match"}
              >
                {pending && <Spinner />}
                {pending ? "Creating…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Chip({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium hover:bg-muted"
    >
      {children}
    </button>
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

/* utils */
function addHours(d: Date, hours: number) {
  const n = new Date(d);
  n.setHours(n.getHours() + hours);
  return n;
}
function toLocalDatetimeInputValue(d: Date) {
  // yyyy-MM-ddThh:mm (no seconds)
  const pad = (x: number) => String(x).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
