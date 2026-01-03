import { processQueue } from "@/lib/queue";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Validate the cron secret for security
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  
  // If no secret is configured, allow access (for local dev)
  if (!secret) {
    console.warn("CRON_SECRET not set - queue endpoint is unprotected");
    return true;
  }
  
  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) {
    return true;
  }
  
  // Check x-cron-secret header (common for cron services)
  const cronHeader = request.headers.get("x-cron-secret");
  if (cronHeader === secret) {
    return true;
  }
  
  // Check query parameter (fallback for simple cron services)
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  if (querySecret === secret) {
    return true;
  }
  
  return false;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Process pending emails
  await processQueue();
  return NextResponse.json({ ok: true, processed: true });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Process pending emails
  await processQueue();
  return NextResponse.json({ ok: true, processed: true });
}
