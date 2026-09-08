"use server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { Position, TeamName } from "@/lib/teams";
import { POSITIONS } from "@/lib/teams";

const adminGuard = async () => {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN")
    throw new Error("Unauthorized");
  return session;
};

export async function savePlayerSkills(
  updates: { userId: string; position: Position; score: number }[]
) {
  await adminGuard();
  if (updates.length === 0) return { ok: true };

  for (const u of updates) {
    if (!POSITIONS.includes(u.position))
      throw new Error(`Invalid position: ${u.position}`);
    if (!Number.isInteger(u.score) || u.score < 1 || u.score > 10)
      throw new Error("Scores must be integers between 1 and 10");
  }

  await prisma.$transaction(
    updates.map((u) =>
      prisma.playerSkill.upsert({
        where: { userId_position: { userId: u.userId, position: u.position } },
        create: { userId: u.userId, position: u.position, score: u.score },
        update: { score: u.score },
      })
    )
  );

  revalidatePath("/admin/ratings");
  revalidatePath("/admin/teams");
  return { ok: true };
}

export async function saveTeams(
  matchId: string,
  assignments: { userId: string; team: TeamName; position: Position }[]
) {
  await adminGuard();
  if (assignments.length === 0) throw new Error("No players assigned");

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) throw new Error("Match not found");
  if (match.settled) throw new Error("Match already settled");

  await prisma.$transaction([
    // Drop stale assignments for players no longer in the lineup
    prisma.matchParticipant.deleteMany({
      where: { matchId, userId: { notIn: assignments.map((a) => a.userId) } },
    }),
    ...assignments.map((a) =>
      prisma.matchParticipant.upsert({
        where: { matchId_userId: { matchId, userId: a.userId } },
        create: {
          matchId,
          userId: a.userId,
          team: a.team,
          position: a.position,
        },
        update: { team: a.team, position: a.position },
      })
    ),
  ]);

  revalidatePath("/admin/teams");
  revalidatePath("/admin/settle");
  revalidatePath("/matches");
  return { ok: true };
}
