"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { admin } from "@/content/admin-en";
import {
  clearFailures,
  getClientIp,
  isBlocked,
  LIMIT_PER_IP,
  LIMIT_PER_USERNAME,
  recordFailure,
} from "@/lib/login-throttle";
import { verifyAgainstDummy, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";

export type LoginState = { error: string } | undefined;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password || username.length > 100 || password.length > 200) {
    return { error: admin.login.required };
  }

  const ipKey = `ip:${await getClientIp()}`;
  const userKey = `user:${username}`;

  try {
    if ((await isBlocked(ipKey, LIMIT_PER_IP)) || (await isBlocked(userKey, LIMIT_PER_USERNAME))) {
      return { error: admin.login.blocked };
    }

    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);

    if (!user) {
      await verifyAgainstDummy(password);
      await recordFailure(ipKey);
      return { error: admin.login.invalid };
    }

    if (!(await verifyPassword(password, user.passwordHash))) {
      await recordFailure(ipKey);
      await recordFailure(userKey);
      return { error: admin.login.invalid };
    }

    await clearFailures(ipKey);
    await clearFailures(userKey);
    await createSession(user.id, user.passwordHash);
  } catch (err) {
    console.error("Login failed:", err);
    return { error: admin.login.failed };
  }

  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}
