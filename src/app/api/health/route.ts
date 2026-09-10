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
export async function GET() {
  const startedAt = Date.now();

  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json(
      {
        status: "ok",
        database: "reachable",
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
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
