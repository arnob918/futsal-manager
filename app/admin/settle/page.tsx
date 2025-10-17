import { prisma } from "@/lib/db";
import { settleMatch } from "@/app/(actions)/matchActions";

export default async function SettlePage() {
  const matches = await prisma.match.findMany({ orderBy: { date: "desc" } });
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  async function action(formData: FormData) {
    "use server";
    const matchId = formData.get("matchId") as string;
    const payerId = formData.get("payerId") as string;
    const totalUSD = Number(formData.get("totalUSD"));
    const total = Math.round(totalUSD * 100);
    const participantIds = formData.getAll("participants") as string[];
    await settleMatch(matchId, total, participantIds);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settle Match</h1>
      <form action={action} className="space-y-2">
        <label>Match</label>
        <select className="border px-2 py-2 w-full" name="matchId" required>
          {matches.map((m: any) => (
            <option key={m.id} value={m.id}>
              {m.date.toLocaleString()} {m.location ? `– ${m.location}` : ""}
            </option>
          ))}
        </select>

        <label>Total Cost</label>
        <input
          className="border px-3 py-2 w-full"
          name="totalUSD"
          type="number"
          step="0.01"
          required
        />

        <label>Participants</label>
        <div className="grid grid-cols-2 gap-2">
          {users.map((u: any) => (
            <label
              key={u.id}
              className="border rounded p-2 flex items-center gap-2"
            >
              <input type="checkbox" name="participants" value={u.id} />
              <span>
                {u.name} ({u.email})
              </span>
            </label>
          ))}
        </div>

        <button className="px-3 py-2 border rounded" type="submit">
          Settle
        </button>
      </form>
    </div>
  );
}
