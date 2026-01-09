"use server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function requestFund(amount: number, note?: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  const userId = (session.user as any).id as string;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  await prisma.fundRequest.create({
    data: { userId, amount: amount, note },
  });

  const adminEmailsEnv = process.env.ADMIN_EMAIL_LIST;
  if (adminEmailsEnv) {
    let adminEmails: string[] = [];
    try {
      // Try parsing as JSON first
      adminEmails = JSON.parse(adminEmailsEnv);
    } catch {
      // Fallback to comma-separated
      adminEmails = adminEmailsEnv.split(",").map((e) => e.trim());
    }

    if (Array.isArray(adminEmails)) {
      const { enqueueEmail, processQueue } = await import("@/lib/queue");
      
      await Promise.allSettled(
        adminEmails.map((email) =>
          enqueueEmail("FUND_REQUEST", {
            to: email,
            requesterName: user?.name || "Unknown User",
            amount,
            note,
          })
        )
      );
      
      // Trigger processing
      processQueue().catch(console.error);
    }
  }
}

export async function approveFund(reqId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN")
    throw new Error("Unauthorized");
  
  const result = await prisma.$transaction(async (tx: any) => {
    const fr = await tx.fundRequest.update({
      where: { id: reqId },
      data: { status: "APPROVED" },
      include: { user: { select: { email: true, name: true } } },
    });
    await tx.transaction.create({
      data: {
        userId: fr.userId,
        amount: fr.amount,
        kind: "FUND_TOPUP",
        memo: "Fund top-up approved",
      },
    });
    const sum = await tx.transaction.aggregate({
      _sum: { amount: true },
      where: { userId: fr.userId },
    });
    const newBalance = sum._sum.amount ?? 0;
    await tx.user.update({
      where: { id: fr.userId },
      data: { balance: newBalance },
    });
    
    return {
      userEmail: fr.user?.email,
      userName: fr.user?.name,
      amount: Number(fr.amount),
      newBalance: Number(newBalance),
    };
  });

  // Send confirmation email to user
  if (result.userEmail) {
    const { enqueueEmail, processQueue } = await import("@/lib/queue");
    await enqueueEmail("FUND_APPROVED", {
      to: result.userEmail,
      playerName: result.userName,
      amount: result.amount,
      newBalance: result.newBalance,
    });
    processQueue().catch(console.error);
  }
}

export async function rejectFund(reqId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN")
    throw new Error("Unauthorized");
  await prisma.fundRequest.update({
    where: { id: reqId },
    data: { status: "REJECTED" },
  });
}
