import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { adminUsers } from "../db/schema";
import { hashPassword } from "../lib/password";

config({ path: ".env.local" });

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) throw new Error("DATABASE_URL_UNPOOLED is not set in .env.local");

function ask(question: string, hidden: boolean): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;

    if (!hidden || !stdin.isTTY) {
      stdin.setEncoding("utf8");
      stdin.resume();
      stdin.once("data", (chunk) => {
        stdin.pause();
        resolve(String(chunk).replace(/\r?\n$/, ""));
      });
      return;
    }

    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (char: string) => {
      for (const c of char) {
        if (c === "\r" || c === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        }
        if (c === "\u0003") process.exit(1);
        if (c === "\u007f" || c === "\b") value = value.slice(0, -1);
        else value += c;
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const username = (process.env.ADMIN_USERNAME ?? (await ask("Admin username: ", false))).trim().toLowerCase();
  if (!/^[a-z0-9_.-]{3,50}$/.test(username)) {
    throw new Error("Username must be 3-50 characters: lowercase letters, digits, dot, dash or underscore.");
  }

  const password = process.env.ADMIN_PASSWORD ?? (await ask("Admin password (hidden): ", true));
  if (password.length < 10) throw new Error("Password must be at least 10 characters.");
  if (!process.env.ADMIN_PASSWORD) {
    const again = await ask("Repeat password: ", true);
    if (again !== password) throw new Error("Passwords do not match.");
  }

  const passwordHash = await hashPassword(password);
  const db = drizzle(neon(url!));
  await db
    .insert(adminUsers)
    .values({ username, passwordHash })
    .onConflictDoUpdate({ target: adminUsers.username, set: { passwordHash } });

  console.log(`Admin "${username}" saved. Existing login sessions for this user are now signed out.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
