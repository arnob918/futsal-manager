import Link from "next/link";
export default function Admin() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <ul className="list-disc ml-5">
        <li>
          <Link className="underline" href="/admin/matches">
            Create match
          </Link>
        </li>
        <li>
          <Link className="underline" href="/admin/settle">
            Settle match
          </Link>
        </li>
        <li>
          <Link className="underline" href="/admin/funds">
            Handle fund requests
          </Link>
        </li>
      </ul>
    </div>
  );
}
