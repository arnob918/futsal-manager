// app/admin/ratings/page.tsx
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RatingsGrid from "./RatingsGrid";

export default async function RatingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      skills: { select: { position: true, score: true } },
    },
    orderBy: { name: "asc" },
  });

  const players = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    scores: Object.fromEntries(u.skills.map((s) => [s.position, s.score])) as
      Record<string, number>,
  }));

  return <RatingsGrid players={players} />;
}
