import { NextResponse } from "next/server";
import { approveFund } from "@/app/(actions)/fundActions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body?.id as string;
    if (!id)
      return NextResponse.json(
        { ok: false, error: "missing id" },
        { status: 400 }
      );
    await approveFund(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "error" },
      { status: 500 }
    );
  }
}
