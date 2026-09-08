import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      participations: {
        include: {
          match: true,
        },
      },
    },
  });

  const upcoming = await prisma.match.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 5,
    include: {
      participants: true,
      payer: {
        select: { name: true },
      },
    },
  });

  const pastMatches = await prisma.match.findMany({
    where: {
      date: { lt: new Date() },
    },
    orderBy: { date: "desc" },
    take: 10,
    include: {
      participants: true,
      payer: {
        select: { name: true },
      },
    },
  });

  const userParticipatedMatches =
    user?.participations.map((p) => p.matchId) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card rounded-2xl shadow-sm p-4 sm:p-6 md:p-8 border border-border">
          <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl text-foreground mb-2">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Here's your match overview and balance
          </p>
        </div>

        {/* Balance Card */}
        <div
          className={`bg-gradient-to-br ${
            user?.balance && user?.balance < 0
              ? "from-rose-400 to-rose-500"
              : "from-emerald-500 to-emerald-600"
          } rounded-2xl shadow-lg p-6 md:p-8 text-white`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">
                Current Balance
              </p>
              <p className="text-4xl md:text-5xl font-bold">
                {user?.balance ?? 0} BDT
              </p>
            </div>
            <div className="bg-card/20 p-4 rounded-xl backdrop-blur-sm">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Two Column Layout for Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
          {/* Upcoming Matches */}
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden h-fit">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-foreground">
                  Upcoming Matches
                </h2>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Next matches scheduled
              </p>
            </div>

            <div className="p-4">
              {upcoming.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  No upcoming matches scheduled
                </p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((match) => {
                    const isParticipating = match.participants.some(
                      (p) => p.userId === userId
                    );
                    return (
                      <div
                        key={match.id}
                        className={`border rounded-lg p-3 transition-all hover:shadow-md ${
                          isParticipating
                            ? "border-blue-200 bg-blue-50/50"
                            : "border-border bg-card"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="font-semibold text-foreground text-sm truncate">
                                {new Date(match.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                            {match.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground text-xs truncate">
                                  {match.location}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground text-xs">
                                {match.participants.length} participant
                                {match.participants.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {match.totalCost > 0 && (
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Cost</p>
                                <p className="text-sm font-bold text-foreground">
                                  {match.totalCost} BDT
                                </p>
                              </div>
                            )}
                            {isParticipating && (
                              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                Joined
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Match History */}
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden h-fit">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-foreground">
                  Match History
                </h2>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Your past matches and costs
              </p>
            </div>

            <div className="p-4">
              {pastMatches.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  No match history yet
                </p>
              ) : (
                <div className="space-y-3">
                  {pastMatches.map((match) => {
                    const userParticipant = match.participants.find(
                      (p) => p.userId === userId
                    );
                    const participated = !!userParticipant;
                    
                    const totalHeads = match.participants.reduce(
                      (acc, p) => acc + 1 + (p.guests || 0),
                      0
                    );
                    
                    const costPerHead =
                      totalHeads > 0
                        ? Math.round(match.totalCost / totalHeads)
                        : 0;
                        
                    const userShare = participated
                      ? costPerHead * (1 + (userParticipant.guests || 0))
                      : 0;

                    return (
                      <div
                        key={match.id}
                        className={`border rounded-lg p-3 hover:shadow-md transition-all ${
                          participated
                            ? "border-border bg-card"
                            : "border-border bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="font-semibold text-foreground text-sm truncate">
                                {new Date(match.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                            {match.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground text-xs truncate">
                                  {match.location}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground text-xs">
                                {match.participants.length} participant
                                {match.participants.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            {participated && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  Guests: {userParticipant?.guests || 0}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {participated ? (
                              <>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">
                                    Your Share
                                  </p>
                                  <p className="text-sm font-bold text-emerald-600">
                                    {userShare} BDT
                                  </p>
                                </div>
                                {match.settled ? (
                                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Settled
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                    <Clock className="w-3 h-3" />
                                    Pending
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs font-medium">
                                Not Participated
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
