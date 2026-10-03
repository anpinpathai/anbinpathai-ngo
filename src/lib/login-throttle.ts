import "server-only";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { loginAttempts } from "@/db/schema";

const WINDOW_MINUTES = 15;

export const LIMIT_PER_IP = 5;
export const LIMIT_PER_USERNAME = 20;

export async function getClientIp() {
  const h = await headers();
  return (
    h.get("x-nf-client-connection-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

export async function isBlocked(key: string, limit: number) {
  const [row] = await db
    .select({
      failedCount: loginAttempts.failedCount,
      expired: sql<boolean>`${loginAttempts.windowStartedAt} < now() - interval '${sql.raw(String(WINDOW_MINUTES))} minutes'`,
    })
    .from(loginAttempts)
    .where(eq(loginAttempts.key, key))
    .limit(1);
  return Boolean(row && !row.expired && row.failedCount >= limit);
}

export async function recordFailure(key: string) {
  const expired = sql`${loginAttempts.windowStartedAt} < now() - interval '${sql.raw(String(WINDOW_MINUTES))} minutes'`;
  await db
    .insert(loginAttempts)
    .values({ key, failedCount: 1 })
    .onConflictDoUpdate({
      target: loginAttempts.key,
      set: {
        failedCount: sql`case when ${expired} then 1 else ${loginAttempts.failedCount} + 1 end`,
        windowStartedAt: sql`case when ${expired} then now() else ${loginAttempts.windowStartedAt} end`,
      },
    });
}

export async function clearFailures(key: string) {
  await db.delete(loginAttempts).where(eq(loginAttempts.key, key));
}
