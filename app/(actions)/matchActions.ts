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

  // Send emails AFTER the transaction (don't block/taint the commit if email fails)
  // True fire-and-forget: don't await, let them run in background
  participants.forEach((user: any) => {
    if (!user.email) return;
    
    const pData = participantsData.find((p) => p.userId === user.id);
    const userHeads = 1 + (pData?.guests || 0);
    const userShare = share * userHeads;

    // Run email sending in background without blocking
    (async () => {
      const sendEmailWithRetry = async (retryCount = 0): Promise<void> => {
        try {
          await sendMatchSettledEmail({
            to: user.email,
            playerName: user.name,
            matchDate: match.date,
            location: match.location,
            shareCents: userShare, // Total share for this user (including guests)
            totalCents: totalCostCents,
            playerCount: totalHeads, // This might be misleading if we want total heads, but keeping as player count for now
            perHeadShare: perHeadShare,
            guestCount: pData?.guests || 0,
            updatedBalance: user.balance,
          });
          console.log(`Email sent successfully to ${user.email}`);
        } catch (error: any) {
          // Retry on 421 errors (temporary Gmail issues)
          if (error.responseCode === 421 && retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
            console.warn(`Retrying email to ${user.email} after ${delay}ms (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return sendEmailWithRetry(retryCount + 1);
          }
          
          console.error(`Failed to send email to ${user.email} after ${retryCount + 1} attempts:`, error);
        }
      };
      
      // Start the email sending process
      sendEmailWithRetry().catch(err => 
        console.error(`Unexpected error in email sending for ${user.email}:`, err)
      );
    })();
  });
}
