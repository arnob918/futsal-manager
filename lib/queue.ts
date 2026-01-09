import { prisma } from "@/lib/db";
import {
  sendMatchSettledEmail,
  sendNotificationEmail,
  sendNegativeBalanceEmail,
  sendFundRequestEmail,
  sendFundApprovedEmail,
} from "@/lib/email";

export type EmailType =
  | "MATCH_SETTLED"
  | "NOTIFICATION"
  | "NEGATIVE_BALANCE"
  | "FUND_REQUEST"
  | "FUND_APPROVED";

export async function enqueueEmail(type: EmailType, payload: any) {
  await prisma.emailQueue.create({
    data: {
      type,
      payload,
    },
  });
}

export async function processQueue() {
  // Fetch pending jobs
  // We process one by one or in small batches to avoid timeout
  const jobs = await prisma.emailQueue.findMany({
    where: {
      status: "PENDING",
      attempts: { lt: 3 }, // Max 3 attempts
    },
    orderBy: { createdAt: "asc" },
    take: 5,
  });

  for (const job of jobs) {
    try {
      // Mark as processing
      await prisma.emailQueue.update({
        where: { id: job.id },
        data: { status: "PROCESSING", lastAttempt: new Date() },
      });

      // Execute
      await sendEmailByType(job.type as EmailType, job.payload);

      // Mark as completed
      await prisma.emailQueue.update({
        where: { id: job.id },
        data: { status: "COMPLETED" },
      });
    } catch (error: any) {
      console.error(`Failed to process email job ${job.id}:`, error);
      // Mark as failed or pending for retry
      await prisma.emailQueue.update({
        where: { id: job.id },
        data: {
          status: "PENDING", // Retry
          attempts: { increment: 1 },
          error: error.message || "Unknown error",
        },
      });
    }
  }
}

async function sendEmailByType(type: EmailType, payload: any) {
  switch (type) {
    case "MATCH_SETTLED":
      await sendMatchSettledEmail(payload);
      break;
    case "NOTIFICATION":
      await sendNotificationEmail(payload);
      break;
    case "NEGATIVE_BALANCE":
      await sendNegativeBalanceEmail(payload);
      break;
    case "FUND_REQUEST":
      await sendFundRequestEmail(payload);
      break;
    case "FUND_APPROVED":
      await sendFundApprovedEmail(payload);
      break;
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}
