import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import EmailForm from "./EmailForm";

export default async function AdminEmails() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      balance: true,
    },
  });

  return (
    <div className="space-y-6 p-6 mt-12">
      <header>
        <h1 className="text-2xl font-semibold">Email Notifications</h1>
        <p className="text-sm text-muted-foreground">
          Send email notifications to users.
        </p>
      </header>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <EmailForm users={users} />
      </div>
    </div>
  );
}
