import { prisma } from "@/lib/db";
export default async function Matches() {
  const matches = await prisma.match.findMany({
    orderBy: { date: "desc" },
    include: { participants: { include: { user: true } } },
  });
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Matches</h1>
      <div className="space-y-2">
        {matches.map((m: any) => (
          <div key={m.id} className="border rounded p-3">
            <div>
              <b>{m.date.toLocaleString()}</b>{" "}
              {m.location ? `– ${m.location}` : ""}
            </div>
            <div>
              Total: {(m.totalCost ?? 0) / 100} • Settled:{" "}
              {m.settled ? "Yes" : "No"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
