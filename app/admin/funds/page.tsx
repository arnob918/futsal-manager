import { prisma } from "@/lib/db";
import { approveFund, rejectFund } from "@/app/(actions)/fundActions";

export default async function AdminFunds() {
  const pending = await prisma.fundRequest.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  async function approve(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await approveFund(id);
  }

  async function reject(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await rejectFund(id);
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Fund Requests</h1>
      {pending.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <ul className="space-y-2">
          {pending.map((r: any) => (
            <li
              key={r.id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div>
                <div>
                  <b>{r.user.name}</b> – {(r.amount / 100).toFixed(2)} USD
                </div>
                <div className="text-sm text-gray-500">{r.note}</div>
              </div>
              <div className="flex gap-2">
                <form action={approve}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="px-3 py-2 border rounded" type="submit">
                    Approve
                  </button>
                </form>
                <form action={reject}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="px-3 py-2 border rounded" type="submit">
                    Reject
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
