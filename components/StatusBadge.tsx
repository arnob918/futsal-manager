import * as React from "react";
import { Check, Clock, Minus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Status =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SETTLED"
  | "JOINED"
  | "ABSENT";

const STYLES: Record<
  Status,
  { label: string; icon?: React.ElementType; className: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    className: "border-warning/25 bg-warning/10 text-warning",
  },
  APPROVED: {
    label: "Approved",
    icon: Check,
    className: "border-success/25 bg-success/10 text-success",
  },
  REJECTED: {
    label: "Rejected",
    icon: X,
    className: "border-destructive/25 bg-destructive/10 text-destructive",
  },
  SETTLED: {
    label: "Settled",
    icon: Check,
    className: "border-success/25 bg-success/10 text-success",
  },
  JOINED: {
    label: "Joined",
    icon: Check,
    className: "border-primary/25 bg-primary/10 text-primary",
  },
  ABSENT: {
    label: "Not participated",
    icon: Minus,
    className: "border-transparent bg-muted text-muted-foreground",
  },
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: Status;
  label?: string;
  className?: string;
}) {
  const { label: fallback, icon: Icon, className: tone } = STYLES[status];

  return (
    <Badge variant="outline" className={cn(tone, className)}>
      {Icon && <Icon className="size-3" />}
      {label ?? fallback}
    </Badge>
  );
}
