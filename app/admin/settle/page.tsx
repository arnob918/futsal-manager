// app/(dashboard)/settle/page.tsx
import { prisma } from "@/lib/db";
import { settleMatch } from "@/app/(actions)/matchActions";
import { revalidatePath } from "next/cache";
import SettleForm from "./SettleForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SettlePage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }
  const now = new Date();

  // Only past matches, newest → oldest
  const matches = await prisma.match.findMany({
    where: { date: { lt: now }, settled: false },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      location: true,
      totalCost: true,
      settled: true,
    },
  });

  // Users + their most recent played match date (if any)
  const rawUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      participations: {
        include: { match: { select: { date: true } } },
        orderBy: { match: { date: "desc" } },
        take: 1,
      },
    },
  });

  // Compute lastPlayedAt and sort: recent first, then name
  const users = rawUsers
    .map((u) => ({
      ...u,
      lastPlayedAt: u.participations[0]?.match.date ?? null,
    }))
    .sort((a, b) => {
      const ad = a.lastPlayedAt ? +a.lastPlayedAt : -Infinity;
      const bd = b.lastPlayedAt ? +b.lastPlayedAt : -Infinity;
      if (bd !== ad) return bd - ad;
      return (a.name ?? a.email ?? "").localeCompare(b.name ?? b.email ?? "");
    });

  async function action(formData: FormData) {
    "use server";
    const matchId = String(formData.get("matchId") || "");
    const totalBDT = Number(formData.get("totalBDT"));
    const participantIds = formData.getAll("participants") as string[];

    if (!matchId) throw new Error("Select a match.");
    if (!Number.isFinite(totalBDT) || totalBDT <= 0) {
      throw new Error("Enter a valid total amount (BDT).");
    }
    if (!participantIds.length)
      throw new Error("Select at least one participant.");

    // Round to whole BDT per your schema (totalCost is Int)
    const total = Math.round(totalBDT);

    await settleMatch(matchId, total, participantIds);
    revalidatePath("/matches");
    return { ok: true };
  }

  // Serialize dates for client
  const clientMatches = matches.map((m) => ({
    ...m,
    date: m.date.toISOString(),
  }));
  const clientUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    lastPlayedAt: u.lastPlayedAt ? u.lastPlayedAt.toISOString() : null,
  }));

  return (
    <SettleForm action={action} matches={clientMatches} users={clientUsers} />
  );
}
