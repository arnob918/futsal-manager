// app/admin/teams/page.tsx
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TeamBuilder from "./TeamBuilder";

export default async function TeamsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  // Unsettled matches: upcoming first, then most recent past
  const matches = await prisma.match.findMany({
    where: { settled: false },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      location: true,
      participants: {
        select: { userId: true, team: true, position: true },
      },
    },
  });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      skills: { select: { position: true, score: true } },
    },
    orderBy: { name: "asc" },
  });

  const players = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    scores: Object.fromEntries(u.skills.map((s) => [s.position, s.score])) as
      Record<string, number>,
  }));

  const clientMatches = matches.map((m) => ({
    ...m,
    date: m.date.toISOString(),
  }));

  return <TeamBuilder matches={clientMatches} players={players} />;
}
