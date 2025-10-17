"use server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

const adminGuard = async () => {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN")
    throw new Error("Unauthorized");
  return session;
};

export async function createMatch(formData: FormData) {
  await adminGuard();
  const date = formData.get("date") as string; // ISO
  const location = (formData.get("location") as string) || null;
  // const parsed = z.string().datetime().safeParse(date);
  // if (!parsed.success) throw new Error("Invalid date");
  await prisma.match.create({ data: { date: new Date(date), location } });
}

export async function settleMatch(
  matchId: string,
  totalCost: number,
  participantIds: string[]
) {
  await adminGuard();
  return await prisma.$transaction(async (tx: any) => {
    const match = await tx.match.findUnique({
      where: { id: matchId },
      include: { participants: true },
    });
    if (!match) throw new Error("Match not found");

    const n = participantIds.length;
    if (n === 0) throw new Error("No participants");
    const share = Math.round(totalCost / n);

    // Update match metadata
    await tx.match.update({
      where: { id: matchId },
      data: { totalCost: totalCost, settled: true },
    });

    // Ensure participant rows exist
    for (const uid of participantIds) {
      await tx.matchParticipant.upsert({
        where: { matchId_userId: { matchId, userId: uid } },
        create: { matchId, userId: uid },
        update: {},
      });
    }

    // Debit each participant with their share
    for (const uid of participantIds) {
      await tx.transaction.create({
        data: {
          userId: uid,
          amount: -share,
          memo: `Share for match ${matchId}`,
          kind: "MATCH_PARTICIPANT_DEBIT",
          matchId,
        },
      });
    }

    // Optional: refresh cached balances
    const affected = Array.from(new Set([...participantIds]));
    for (const uid of affected) {
      const sum = await tx.transaction.aggregate({
        _sum: { amount: true },
        where: { userId: uid },
      });
      await tx.user.update({
        where: { id: uid },
        data: { balance: sum._sum.amount ?? 0 },
      });
    }
  });
}
