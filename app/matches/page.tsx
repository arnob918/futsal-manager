// app/(dashboard)/matches/page.tsx  (or wherever your route lives)
import { prisma } from "@/lib/db";
import MatchesView from "./MatchView";

export default async function Matches() {
  const matches = await prisma.match.findMany({
    orderBy: { date: "desc" },
    include: { participants: { include: { user: true } } },
  });

  // Serialize Date for client component
  const initialMatches = matches.map((m) => ({
    ...m,
    date: m.date.toISOString(),
  }));

  return <MatchesView initialMatches={initialMatches} />;
}
