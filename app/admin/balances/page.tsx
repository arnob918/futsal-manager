import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsersTable from "./UsersTable";

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
    <div className="space-y-6 p-6 mt-12">
      <header>
        <h1 className="text-2xl font-semibold">Member Balances</h1>
        <p className="text-sm text-muted-foreground">
          View and manage all participants&apos; current balances
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Total Members
          </div>
          <div className="mt-1 text-2xl font-semibold">{stats.totalUsers}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Total Balance
          </div>
          <div className="mt-1 text-2xl font-semibold">
            {formatBDT(stats.totalBalance)}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Average Balance
          </div>
          <div className="mt-1 text-2xl font-semibold">
            {formatBDT(stats.averageBalance)}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Negative Balances
          </div>
          <div className="mt-1 text-2xl font-semibold">
            {stats.negativeBalances}
          </div>
        </div>
      </div>

      {/* Interactive table */}
      <UsersTable initialUsers={users} />
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
