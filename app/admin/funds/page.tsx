import Image from "next/image";
import ActionButtons from "./ActionButtons";
import { prisma } from "@/lib/db";
import { approveFund, rejectFund } from "@/app/(actions)/fundActions";

export default async function AdminFunds() {
  const pending = await prisma.fundRequest.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  async function approve(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await approveFund(id);
  }

  async function reject(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await rejectFund(id);
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Fund Requests</h1>

      {pending.length === 0 ? (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          No pending requests
        </div>
      ) : (
        <ul className="space-y-3">
          {pending.map((r: any) => (
            <li
              key={r.id}
              className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 sm:items-center">
                <div className="shrink-0">
                  {r.user?.image ? (
                    <Image
                      src={r.user.image}
                      alt={r.user?.name ?? r.user?.email ?? "user"}
                      width={44}
                      height={44}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="rounded-full bg-gray-100 w-11 h-11 grid place-items-center text-sm font-medium text-gray-700">
                      {(r.user?.name || r.user?.email || "?")
                        .split(" ")
                        .map((s: string) => s?.[0])
                        .slice(0, 2)
                        .join("") || "?"}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm font-medium">
                    {r.user?.name ?? r.user?.email ?? "User"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {r.user?.email}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{r.note}</div>
                  <div className="text-xs text-gray-400 mt-2">
                    Requested: {prettyDate(new Date(r.createdAt))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 sm:mt-0">
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {formatBDT(r.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">Amount</div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div>
                    {/* Client-side action buttons that call API routes and refresh the page */}
                    <ActionButtons id={r.id} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatBDT(n: number) {
  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)}৳`;
  }
}

function prettyDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
