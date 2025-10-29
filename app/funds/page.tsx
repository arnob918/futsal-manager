// app/(dashboard)/funds/page.tsx
import { requestFund } from "@/app/(actions)/fundActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import FundsView from "./FundsView";
import { revalidatePath } from "next/cache";

const CHANNELS = ["Bank", "Bkash", "Rocket", "Nagad", "Other"] as const;

export default async function Funds() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string;

  const requests = await prisma.fundRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const initialRequests = requests.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  async function action(formData: FormData) {
    "use server";
    const amount = Number(formData.get("amount"));
    const channel = String(formData.get("channel"));
    const userNoteRaw = (formData.get("userNote") as string) || "";

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Please enter a valid positive amount.");
    }
    if (!CHANNELS.includes(channel as any)) {
      throw new Error("Please select a valid payment method.");
    }

    const builtNote = userNoteRaw ? `${channel} — ${userNoteRaw}` : channel;

    await requestFund(amount, builtNote);

    // ✅ Ensure UI refreshes with the new request
    revalidatePath("/funds");
    return { ok: true };
  }

  return (
    <FundsView
      action={action}
      initialRequests={initialRequests}
      channels={[...CHANNELS]}
    />
  );
}
