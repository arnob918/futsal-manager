// app/(dashboard)/funds/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import FundsView from "./FundsView";

export default async function Funds({ params }: { params: { uid: string } }) {
  const session = await getServerSession(authOptions);
  // Prefer UID from route params for this admin route. Fall back to session user id if missing.
  const userId = params.uid;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      participations: {
        include: {
          match: true,
        },
      },
    },
  });

  // Fetch fund requests
  const requests = await prisma.fundRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Fetch all transactions for the user
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: { match: true },
    orderBy: { createdAt: "desc" },
  });

  const initialRequests = requests.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  const initialTransactions = transactions.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    match: t.match
      ? {
          ...t.match,
          date: t.match.date.toISOString(),
          createdAt: t.match.createdAt.toISOString(),
        }
      : null,
  }));

  return (
    <FundsView
      initialRequests={initialRequests}
      initialTransactions={initialTransactions}
      userBalance={user?.balance}
      userName={user?.name || "User"}
    />
  );
}
