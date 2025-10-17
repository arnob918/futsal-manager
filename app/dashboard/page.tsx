import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const upcoming = await prisma.match.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 5,
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Welcome{user?.name ? `, ${user.name}` : ""}
      </h1>
      <div className="border rounded p-3">
        Current balance: <b>{(user?.balance ?? 0) / 100} USD</b>
      </div>
      <div>
        <h2 className="font-semibold mb-2">Upcoming matches</h2>
        <ul className="list-disc ml-5">
          {upcoming.map((m: any) => (
            <li key={m.id}>
              {m.date.toLocaleString()} {m.location ? `– ${m.location}` : ""}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
