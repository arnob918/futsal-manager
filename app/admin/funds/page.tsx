import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import ActionButtons from "./ActionButtons";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getInitials, prettyDateTime } from "@/lib/format";
import { Money } from "@/components/Money";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminFunds() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  const pending = await prisma.fundRequest.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fund requests"
        description={
          pending.length === 0
            ? "Nothing waiting on you right now."
            : `${pending.length} request${pending.length === 1 ? "" : "s"} awaiting approval.`
        }
      />

      {pending.length === 0 ? (
        <Card>
          <CardContent>
            <p className="py-8 text-center text-sm text-muted-foreground">
              No pending requests
            </p>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {pending.map((r) => (
            <li key={r.id}>
              <Card>
                <CardContent className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-4">
                    <Avatar className="size-11">
                      {r.user?.image && <AvatarImage src={r.user.image} alt="" />}
                      <AvatarFallback>
                        {getInitials(r.user?.name ?? r.user?.email)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium">
                        {r.user?.name ?? r.user?.email ?? "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.user?.email}
                      </p>
                      {r.note && <p className="text-sm">{r.note}</p>}
                      <p className="text-xs text-muted-foreground">
                        Requested {prettyDateTime(new Date(r.createdAt))}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:border-0 sm:pt-0">
                    {/* Phone: amount reads as a labelled row. Desktop: right-aligned block. */}
                    <div className="flex items-baseline justify-between gap-2 sm:block sm:shrink-0 sm:text-right">
                      <span className="text-xs text-muted-foreground sm:hidden">
                        Amount
                      </span>
                      <p className="text-lg font-semibold">
                        <Money amount={r.amount} />
                      </p>
                      <p className="hidden text-xs text-muted-foreground sm:block">
                        Amount
                      </p>
                    </div>

                    <ActionButtons id={r.id} />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
