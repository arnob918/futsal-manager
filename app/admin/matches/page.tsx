// app/(dashboard)/matches/new/page.tsx
import { createMatch } from "@/app/(actions)/matchActions";
import { revalidatePath } from "next/cache";
import CreateMatchForm from "./CreateMatchForm";
import { string } from "zod/mini";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function CreateMatchPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }
  async function action(formData: FormData) {
    "use server";
    // Your createMatch should read: date (datetime-local) & location
    await createMatch(formData);

    // Refresh the matches listing
    revalidatePath("/admin/matches");

    // Return something the client can react to
    return { ok: true };
  }

  return <CreateMatchForm action={action} />;
}
