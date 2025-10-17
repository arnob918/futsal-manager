import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password)
    return NextResponse.json({ error: "Missing" }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing)
    return NextResponse.json({ error: "Email in use" }, { status: 400 });
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash } });
  return NextResponse.json({ ok: true });
}
