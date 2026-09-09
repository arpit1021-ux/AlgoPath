import { cache } from "react";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/** Connection-class failures worth one more attempt against a sleeping DB. */
const TRANSIENT = [
  "connection terminated",
  "connection timeout",
  "timeout exceeded",
  "econnreset",
  "econnrefused",
  "etimedout",
  "socket hang up",
  "server closed the connection",
  "terminating connection",
  "can't reach database server",
];

function isTransient(error: unknown): boolean {
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return TRANSIENT.some((t) => msg.includes(t));
}

/**
 * Run a database operation, retrying once if it failed for a connection
 * reason. Only wrap work that is safe to run twice.
 */
export async function withDbRetry<T>(
  op: () => Promise<T>,
  { attempts = 2, delayMs = 750 }: { attempts?: number; delayMs?: number } = {}
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await op();
    } catch (error) {
      lastError = error;
      if (i === attempts - 1 || !isTransient(error)) throw error;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastError;
}

/**
 * Translate a Clerk id to our user row. Every route needs this, so without
 * caching it is one extra round trip per route per request. React's cache()
 * dedupes it for the lifetime of a single request.
 */
export const getUserByClerkId = cache(async (clerkId: string) => {
  return db.user.findUnique({ where: { clerkId } });
});
