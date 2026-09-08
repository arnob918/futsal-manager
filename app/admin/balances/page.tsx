import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsersTable from "./UsersTable";
import SendAllButton from "./SendAllButton";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminBalances() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  // Get all users with their balances, ordered by name
  const users = await prisma.user.findMany({
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      balance: true,
      participations: true,
      transactions: true,
    },
  });

  // Calculate stats
  const stats = {
    totalUsers: users.length,
    totalBalance: users.reduce((sum, u) => sum + (u.balance ?? 0), 0),
    averageBalance: users.length
      ? Math.round(
          (users.reduce((sum, u) => sum + (u.balance ?? 0), 0) / users.length) *
            100
        ) / 100
      : 0,
    negativeBalances: users.filter((u) => (u.balance ?? 0) < 0).length,
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Member Balances</h1>
          <p className="text-sm text-muted-foreground">
            View and manage all participants&apos; current balances
          </p>
        </div>
        <SendAllButton
          userIds={users
            .filter((u) => (u.balance ?? 0) < 0)
            .map((u) => u.id)}
        />
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Total Members" value={stats.totalUsers} />
        <Stat label="Total Balance" value={formatBDT(stats.totalBalance)} />
        <Stat label="Average Balance" value={formatBDT(stats.averageBalance)} />
        <Stat
          label="Negative Balances"
          value={stats.negativeBalances}
          tone={stats.negativeBalances > 0 ? "danger" : undefined}
        />
      </div>

      {/* Interactive table */}
      <UsersTable initialUsers={users} />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "danger";
}) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="px-4">
        <div className="text-xs font-medium text-muted-foreground sm:text-sm">
          {label}
        </div>
        <div
          className={`mt-1 text-xl font-semibold tabular-nums sm:text-2xl ${
            tone === "danger" ? "text-rose-600" : ""
          }`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
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
