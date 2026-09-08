import { getServerSession } from "next-auth";
import Link from "next/link";
import { Calendar, Clock, MapPin, Users, Wallet } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { shortDate, shortDateTime } from "@/lib/format";
import { Money } from "@/components/Money";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MatchRow = {
  id: string;
  date: Date;
  location: string | null;
  totalCost: number;
  settled: boolean;
  participants: { userId: string; guests: number | null }[];
};

function MatchMeta({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{children}</span>
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">{children}</p>
  );
}

function UpcomingList({
  matches,
  userId,
}: {
  matches: MatchRow[];
  userId: string;
}) {
  if (matches.length === 0) {
    return <EmptyState>No upcoming matches scheduled</EmptyState>;
  }

  return (
    <ul className="divide-y">
      {matches.map((match) => {
        const joined = match.participants.some((p) => p.userId === userId);

        return (
          <li key={match.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-medium">
                {shortDateTime(match.date)}
              </p>
              {match.location && (
                <MatchMeta icon={MapPin}>{match.location}</MatchMeta>
              )}
              <MatchMeta icon={Users}>
                {`${match.participants.length} participant${match.participants.length === 1 ? "" : "s"}`}
              </MatchMeta>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {match.totalCost > 0 && (
                <span className="text-sm font-medium">
                  <Money amount={match.totalCost} />
                </span>
              )}
              {joined && <StatusBadge status="JOINED" />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function HistoryList({
  matches,
  userId,
}: {
  matches: MatchRow[];
  userId: string;
}) {
  if (matches.length === 0) {
    return <EmptyState>No match history yet</EmptyState>;
  }

  return (
    <ul className="divide-y">
      {matches.map((match) => {
        const participant = match.participants.find((p) => p.userId === userId);
        const totalHeads = match.participants.reduce(
          (acc, p) => acc + 1 + (p.guests || 0),
          0
        );
        const costPerHead =
          totalHeads > 0 ? Math.round(match.totalCost / totalHeads) : 0;
        const share = participant
          ? costPerHead * (1 + (participant.guests || 0))
          : 0;

        return (
          <li key={match.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0 space-y-1">
              <p className="truncate text-sm font-medium">
                {shortDate(match.date)}
              </p>
              {match.location && (
                <MatchMeta icon={MapPin}>{match.location}</MatchMeta>
              )}
              <MatchMeta icon={Users}>
                {`${match.participants.length} participant${
                  match.participants.length === 1 ? "" : "s"
                }${
                  participant?.guests
                    ? ` · ${participant.guests} guest${participant.guests === 1 ? "" : "s"}`
                    : ""
                }`}
              </MatchMeta>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {participant ? (
                <>
                  <div className="text-right">
                    <p className="text-[11px] text-muted-foreground">
                      Your share
                    </p>
                    <p className="text-sm font-medium">
                      <Money amount={share} />
                    </p>
                  </div>
                  <StatusBadge status={match.settled ? "SETTLED" : "PENDING"} />
                </>
              ) : (
                <StatusBadge status="ABSENT" />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string;

  const [user, upcoming, pastMatches] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, balance: true },
    }),
    prisma.match.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 5,
      include: { participants: true },
    }),
    prisma.match.findMany({
      where: { date: { lt: new Date() } },
      orderBy: { date: "desc" },
      take: 10,
      include: { participants: true },
    }),
  ]);

  const balance = user?.balance ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome${user?.name ? `, ${user.name}` : ""}`}
        description="Your match overview and balance"
      />

      <Card>
        <CardHeader>
          <CardDescription>Current balance</CardDescription>
          <CardTitle className="text-3xl sm:text-4xl">
            <Money amount={balance} tone="sign" />
          </CardTitle>
          <CardAction>
            <Button asChild size="sm">
              <Link href="/funds">
                <Wallet className="size-4" />
                Add funds
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        {balance < 0 && (
          <CardContent>
            <p className="text-sm text-destructive">
              You&apos;re behind on settlements. Top up to clear your balance.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Mobile: one card, two tabs — the two lists stacked made for a very long scroll. */}
      <Card className="lg:hidden">
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList className="w-full">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="pt-4">
              <UpcomingList matches={upcoming} userId={userId} />
            </TabsContent>
            <TabsContent value="history" className="pt-4">
              <HistoryList matches={pastMatches} userId={userId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Desktop: side by side. */}
      <div className="hidden gap-6 lg:grid lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4 text-muted-foreground" />
              Upcoming matches
            </CardTitle>
            <CardDescription>Next matches scheduled</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent>
            <UpcomingList matches={upcoming} userId={userId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-muted-foreground" />
              Match history
            </CardTitle>
            <CardDescription>Your past matches and costs</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent>
            <HistoryList matches={pastMatches} userId={userId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
