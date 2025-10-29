// app/(dashboard)/matches/new/page.tsx
import { createMatch } from "@/app/(actions)/matchActions";
import { revalidatePath } from "next/cache";
import CreateMatchForm from "./CreateMatchForm";
import { string } from "zod/mini";

export default function CreateMatchPage() {
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
