"use server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


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
  participantsData: { userId: string; guests: number }[]
) {
  await adminGuard();

  // Import Prisma for transaction isolation level
  const { Prisma } = require("@prisma/client");
  const totalHeads = participantsData.reduce(
    (acc, p) => acc + 1 + p.guests,
    0
  );
  
  const perHeadShare = Math.round(totalCostCents / totalHeads);

  // Do all DB work atomically first
  const { match, share, participants } = await prisma.$transaction(
    async (tx: any) => {
      const m = await tx.match.findUnique({
        where: { id: matchId },
        include: { participants: true },
      });
      if (!m) throw new Error("Match not found");
      if (participantsData.length === 0) throw new Error("No participants");

      // Calculate total heads (players + guests)

      // Update match
      await tx.match.update({
        where: { id: matchId },
        data: { totalCost: totalCostCents, settled: true },
      });

      // Ensure participant rows exist - use Promise.all for batch operations
      await Promise.all(
        participantsData.map((p) =>
          tx.matchParticipant.upsert({
            where: { matchId_userId: { matchId, userId: p.userId } },
            create: { matchId, userId: p.userId, guests: p.guests },
            update: { guests: p.guests },
          })
        )
      );

      // Debit participants with their share - use Promise.all for batch operations
      await Promise.all(
        participantsData.map((p) => {
          const userShare = perHeadShare * (1 + p.guests);
          return tx.transaction.create({
            data: {
              userId: p.userId,
              amount: -userShare,
              memo: `Share for match ${matchId} (${1 + p.guests} heads)`,
              kind: "MATCH_PARTICIPANT_DEBIT",
              matchId,
            },
          });
        })
      );

      // Refresh cached balances - use Promise.all for batch operations
      const affected = participantsData.map((p) => p.userId);
      const balanceUpdates = await Promise.all(
        affected.map(async (uid) => {
          const sum = await tx.transaction.aggregate({
            _sum: { amount: true },
            where: { userId: uid },
          });
          return tx.user.update({
            where: { id: uid },
            data: { balance: sum._sum.amount ?? 0 },
          });
        })
      );

      // Fetch emails & names for notifications (outside of the looped writes)
      const usersWithUpdatedBalance = await tx.user.findMany({
        where: { id: { in: affected } },
        select: { id: true, email: true, name: true, balance: true },
      });

      return {
        match: m,
        share: perHeadShare,
        participants: usersWithUpdatedBalance,
      };
    },
    {
      maxWait: 100000, // 100s max wait time
      timeout: 1000000, // 1000s timeout
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, // Less strict isolation level
    }
  );

  // Send emails via queue
  // True fire-and-forget: don't await, let them run in background
  const { enqueueEmail } = await import("@/lib/queue");
  
  await Promise.all(
    participants.map(async (user: any) => {
      if (!user.email) return;
      
      const pData = participantsData.find((p) => p.userId === user.id);
      const userHeads = 1 + (pData?.guests || 0);
      const userShare = share * userHeads;

      await enqueueEmail("MATCH_SETTLED", {
        to: user.email,
        playerName: user.name,
        matchDate: match.date,
        location: match.location,
        shareCents: userShare,
        totalCents: totalCostCents,
        playerCount: totalHeads,
        perHeadShare: perHeadShare,
        guestCount: pData?.guests || 0,
        updatedBalance: user.balance,
      });
    })
  );

  // Trigger queue processing (fire-and-forget)
  // We use a fully qualified URL if possible, or relative if on same host (but fetch needs absolute usually in server actions?)
  // Actually, in server actions, we can just call the function directly if we want, but we want it async/detached.
  // But since we are in a server action, calling an API route via fetch is a good way to detach.
  // However, we don't know the base URL easily. 
  // A better way might be to just not await the processQueue() call if we import it?
  // But Next.js might kill the lambda if we return.
  // The safest way in Vercel/Next.js is often just to await it if it's fast, or use a cron/external trigger.
  // But for now, let's try to just call processQueue() without awaiting it, or await it if we want to ensure it starts.
  // Given the user wants to speed up the response, we should enqueue (fast) and then maybe trigger processing.
  // Let's try importing processQueue and calling it without await, but catching errors.
  
  const { processQueue } = await import("@/lib/queue");
  processQueue().catch(err => console.error("Background queue processing failed", err));
}
