"use server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendMatchSettledEmail } from "@/lib/email";

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
  totalCostCents: number,
  participantIds: string[]
) {
  await adminGuard();

  // Do all DB work atomically first
  const { match, share, participants } = await prisma.$transaction(
    async (tx) => {
      const m = await tx.match.findUnique({
        where: { id: matchId },
        include: { participants: true },
      });
      if (!m) throw new Error("Match not found");
      if (participantIds.length === 0) throw new Error("No participants");

      const perShare = Math.round(totalCostCents / participantIds.length);

      // Update match
      await tx.match.update({
        where: { id: matchId },
        data: { totalCost: totalCostCents, settled: true },
      });

      // Ensure participant rows exist
      for (const uid of participantIds) {
        await tx.matchParticipant.upsert({
          where: { matchId_userId: { matchId, userId: uid } },
          create: { matchId, userId: uid },
          update: {},
        });
      }

      // Debit participants with their share
      for (const uid of participantIds) {
        await tx.transaction.create({
          data: {
            userId: uid,
            amount: -perShare,
            memo: `Share for match ${matchId}`,
            kind: "MATCH_PARTICIPANT_DEBIT",
            matchId,
          },
        });
      }

      // Refresh cached balances (optional)
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

      // Fetch emails & names for notifications (outside of the looped writes)
      const users = await tx.user.findMany({
        where: { id: { in: participantIds } },
        select: { id: true, email: true, name: true },
      });

      return {
        match: m,
        share: perShare,
        participants: users,
      };
    }
  );

  // Send emails AFTER the transaction (don’t block/taint the commit if email fails)
  // Fire-and-forget style with logging; do not throw if one email fails
  await Promise.allSettled(
    participants.map((u) =>
      u.email
        ? sendMatchSettledEmail({
            to: u.email,
            playerName: u.name,
            matchDate: match.date,
            location: match.location,
            shareCents: share,
            totalCents: totalCostCents,
          })
        : Promise.resolve()
    )
  );
}
