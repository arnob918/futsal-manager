"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function ActionButtons({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState<"approve" | "reject" | null>(
    null
  );

  async function runAction(action: "approve" | "reject") {
    if (pending) return;
    setPending(action);
    try {
      const res = await fetch(`/api/admin/funds/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Request failed");
      // Refresh the current route so server components re-run and reflect changes
      router.refresh();
      toast.success(action === "approve" ? "Request approved" : "Request rejected");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't update the request", {
        description: "Please try again.",
      });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
      <Button
        type="button"
        disabled={pending !== null}
        onClick={() => runAction("approve")}
      >
        {pending === "approve" && <Loader2 className="size-4 animate-spin" />}
        Approve
      </Button>
      <Button
        type="button"
        variant="outline"
        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={pending !== null}
        onClick={() => runAction("reject")}
      >
        {pending === "reject" && <Loader2 className="size-4 animate-spin" />}
        Reject
      </Button>
    </div>
  );
}
