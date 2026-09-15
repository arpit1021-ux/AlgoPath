import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Never cached: a health probe must reflect the current process, not a
// build-time snapshot.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Liveness + readiness for the container healthcheck and, later, the load
 * balancer. It touches the database on purpose: a process that is up but
 * cannot reach Postgres is not ready to serve, and reporting it healthy just
 * routes traffic at a broken instance.
 */
/**
 * "live" or "test", read from the publishable key's prefix. The publishable
 * key is public by design, so reporting which Clerk instance the running
 * container is wired to leaks nothing -- and it answers the question that is
 * otherwise only answerable by trying to sign in: did this deploy actually
 * pick up the production keys, or is it still pointed at the dev instance?
 */
function clerkMode(): "live" | "test" | "unset" {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  if (pk.startsWith("pk_live_")) return "live";
  if (pk.startsWith("pk_test_")) return "test";
  return "unset";
}

export async function GET() {
  const startedAt = Date.now();

  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: "ok",
        database: "reachable",
        clerk: clerkMode(),
        latencyMs: Date.now() - startedAt,
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    // No error detail in the body — health endpoints are usually reachable
    // from outside and should not leak connection strings or driver internals.
    return NextResponse.json(
      {
        status: "degraded",
        database: "unreachable",
        clerk: clerkMode(),
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
