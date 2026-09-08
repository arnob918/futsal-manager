import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import EmailForm from "./EmailForm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-6">
      <PageHeader
        title="Email notifications"
        description="Send email notifications to users."
      />

      <Card>
        <CardContent>
          <EmailForm users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
