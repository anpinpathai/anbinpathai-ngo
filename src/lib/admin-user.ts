import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";

export async function getAdminUsername(adminId: number) {
  const [row] = await db
    .select({ username: adminUsers.username })
    .from(adminUsers)
    .where(eq(adminUsers.id, adminId))
    .limit(1);
  return row?.username ?? "";
}
