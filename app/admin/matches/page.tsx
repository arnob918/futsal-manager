import { createMatch } from "@/app/(actions)/matchActions";

export default function CreateMatchPage() {
  async function action(formData: FormData) {
    "use server";
    await createMatch(formData);
  }
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">New Match</h1>
      <form action={action} className="space-y-2">
        <input
          className="border px-3 py-2 w-full"
          type="datetime-local"
          name="date"
          required
        />
        <input
          className="border px-3 py-2 w-full"
          name="location"
          placeholder="Location (optional)"
        />
        <button className="px-3 py-2 border rounded" type="submit">
          Create
        </button>
      </form>
    </div>
  );
}
