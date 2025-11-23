"use server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendFundRequestEmail } from "@/lib/email";

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
      await Promise.allSettled(
        adminEmails.map((email) =>
          sendFundRequestEmail({
            to: email,
            requesterName: user?.name || "Unknown User",
            amount,
            note,
          })
        )
      );
    }
  }
}

export async function approveFund(reqId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN")
    throw new Error("Unauthorized");
  return await prisma.$transaction(async (tx: any) => {
    const fr = await tx.fundRequest.update({
      where: { id: reqId },
      data: { status: "APPROVED" },
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
    await tx.user.update({
      where: { id: fr.userId },
      data: { balance: sum._sum.amount ?? 0 },
    });
  });
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
