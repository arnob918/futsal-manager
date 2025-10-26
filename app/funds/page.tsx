import { requestFund } from "@/app/(actions)/fundActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function Funds() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string;
  const requests = await prisma.fundRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  async function action(formData: FormData) {
    "use server";
    const amt = Number(formData.get("amount"));
    const note = (formData.get("note") as string) || undefined;
    await requestFund(amt, note);
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Add funds</h1>
      <form action={action} className="space-y-2">
        <input
          className="border px-3 py-2 w-full"
          name="amount"
          placeholder="Amount (BDT)"
          type="number"
          step="0.01"
          required
        />
        <textarea
          className="border px-3 py-2 w-full"
          name="note"
          placeholder="Optional note"
        ></textarea>
        <button className="px-3 py-2 border rounded" type="submit">
          Request
        </button>
      </form>
      <div>
        <h2 className="font-semibold mb-2">My requests</h2>
        <ul className="space-y-2">
          {requests.map((r: any) => (
            <li key={r.id} className="border rounded p-2 flex justify-between">
              <span>
                {r.amount.toFixed(2)} – {r.status}
              </span>
              <span className="text-sm text-gray-500">
                {r.createdAt.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
