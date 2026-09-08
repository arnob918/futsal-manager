"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

function Chip({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick}>
      <Badge
        variant="outline"
        className="cursor-pointer transition-colors hover:bg-accent"
      >
        {children}
      </Badge>
    </button>
  );
}

export default function CreateMatchForm({
  action,
}: {
  action: (formData: FormData) => Promise<{ ok: boolean }>;
}) {
  const router = useRouter();

  const [date, setDate] = React.useState<string>(() =>
    toLocalDatetimeInputValue(addHours(new Date(), 2))
  );
  const [location, setLocation] = React.useState("");
  const [pending, setPending] = React.useState(false);

  const minDateStr = toLocalDatetimeInputValue(new Date());

  async function handleSubmit(formData: FormData) {
    setPending(true);
    try {
      const res = await action(formData);
      if (!res || res.ok) {
        toast.success("Match created");
        router.push("/admin/matches");
      }
    } catch (e: any) {
      toast.error("Couldn't create the match", {
        description: e?.message || "Failed to create match.",
      });
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
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="New match"
        description="Schedule a match. Players see it on their dashboard right away."
      />

      <Card>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(new FormData(e.currentTarget));
            }}
            className="grid gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="date">Date &amp; time</Label>
              <Input
                id="date"
                type="datetime-local"
                name="date"
                required
                min={minDateStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <Chip onClick={setTonight}>Tonight (+2h)</Chip>
                <Chip onClick={setTomorrow8pm}>Tomorrow 8:00 PM</Chip>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. Sports Arena"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={120}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={pending || !date}
                className="w-full sm:w-auto"
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                {pending ? "Creating…" : "Create match"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
