import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsersTable from "./UsersTable";
import SendAllButton from "./SendAllButton";
import { Card, CardContent } from "@/components/ui/card";
import { Money } from "@/components/Money";
import { PageHeader } from "@/components/PageHeader";

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
      <PageHeader
        title="Member balances"
        description="View and manage all participants' current balances"
        actions={
          <SendAllButton
            userIds={users.filter((u) => (u.balance ?? 0) < 0).map((u) => u.id)}
          />
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Total members" value={stats.totalUsers} />
        <Stat
          label="Total balance"
          value={<Money amount={stats.totalBalance} tone="sign" />}
        />
        <Stat
          label="Average balance"
          value={<Money amount={stats.averageBalance} tone="sign" />}
        />
        <Stat
          label="Negative balances"
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
            tone === "danger" ? "text-destructive" : ""
          }`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
