"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";


export async function sendEmailAction(data: {
  userIds: string[];
  subject: string;
  message: string;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const { userIds, subject, message } = data;

  if (!userIds.length || !subject || !message) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        email: true,
        name: true,
      },
    });

    const { enqueueEmail, processQueue } = await import("@/lib/queue");

    const results = await Promise.allSettled(
      users.map((u) =>
        enqueueEmail("NOTIFICATION", {
          to: u.email,
          subject,
          message,
          playerName: u.name,
        })
      )
    );

    // Trigger processing
    processQueue().catch(console.error);

    const failed = results.filter((r) => r.status === "rejected").length;
    const succeeded = results.length - failed;

    return {
      success: true,
      message: `Queued ${succeeded} emails. Failed: ${failed}`,
    };
  } catch (error) {
    console.error("Error sending emails:", error);
    return { success: false, error: "Failed to send emails" };
  }
}

export async function sendNegativeBalanceEmailAction(userIds: string[]) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  if (!userIds.length) {
    return { success: false, error: "No users specified" };
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        email: true,
        name: true,
        balance: true,
      },
    });

    const { enqueueEmail, processQueue } = await import("@/lib/queue");

    const results = await Promise.allSettled(
      users.map((u) => {
        const balance = u.balance;
        const formattedBalance = new Intl.NumberFormat("en-BD", {
          style: "currency",
          currency: "BDT",
          maximumFractionDigits: 2,
        }).format(balance);

        return enqueueEmail("NEGATIVE_BALANCE", {
          to: u.email,
          balance: formattedBalance,
          playerName: u.name,
        });
      })
    );

    // Trigger processing
    processQueue().catch(console.error);

    const failed = results.filter((r) => r.status === "rejected").length;
    const succeeded = results.length - failed;

    return {
      success: true,
      message: `Queued ${succeeded} reminders. Failed: ${failed}`,
    };
  } catch (error) {
    console.error("Error sending emails:", error);
    return { success: false, error: "Failed to send emails" };
  }
}
