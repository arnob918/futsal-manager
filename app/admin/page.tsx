import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  CheckCircle,
  DollarSign,
  Mail,
  Users,
  Wallet,
} from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ACTIONS = [
  {
    href: "/admin/matches",
    icon: Calendar,
    title: "Create match",
    description: "Schedule new matches and add participants",
  },
  {
    href: "/admin/settle",
    icon: CheckCircle,
    title: "Settle match",
    description: "Process match settlements and deduct balances",
  },
  {
    href: "/admin/funds",
    icon: DollarSign,
    title: "Fund requests",
    description: "Approve or reject pending fund requests",
  },
  {
    href: "/admin/balances",
    icon: Wallet,
    title: "User balances",
    description: "View and manage all user account balances",
  },
  {
    href: "/admin/emails",
    icon: Mail,
    title: "Email notifications",
    description: "Send email notifications to users",
  },
];

export default async function Admin() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string;

  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true },
  });

  // Redirect non-admin users to homepage
  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  const [totalUsers, upcomingMatches, pendingFunds, toSettle] =
    await Promise.all([
      prisma.user.count(),
      prisma.match.count({ where: { date: { gte: new Date() } } }),
      prisma.fundRequest.count({ where: { status: "PENDING" } }),
      prisma.match.count({
        where: { date: { lt: new Date() }, settled: false },
      }),
    ]);

  const stats = [
    { icon: Users, label: "Total users", value: totalUsers },
    { icon: Calendar, label: "Upcoming matches", value: upcomingMatches },
    { icon: DollarSign, label: "Pending funds", value: pendingFunds },
    { icon: CheckCircle, label: "To settle", value: toSettle },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description={`Welcome, ${user?.name || "Admin"}. Manage matches, settlements and fund requests.`}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="gap-0 py-4">
            <CardContent className="px-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-4" />
                <span className="text-xs font-medium sm:text-sm">{label}</span>
              </div>
              <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ACTIONS.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/40">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted transition-colors group-hover:bg-primary/10">
                    <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
