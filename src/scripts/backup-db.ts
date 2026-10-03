import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { adminUsers, categories, posts, siteSettings, teamMembers } from "../db/schema";
import { deleteObject, listObjects, putObject } from "./lib/r2";

config({ path: ".env.local", quiet: true });

const KEEP = 12;

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL_UNPOOLED is not set.");

  const localIndex = process.argv.indexOf("--local");
  const localDir = localIndex >= 0 ? process.argv[localIndex + 1] : null;

  const db = drizzle(neon(url));
  const data = {
    version: 1,
    createdAt: new Date().toISOString(),
    tables: {
      categories: await db.select().from(categories),
      site_settings: await db.select().from(siteSettings),
      admin_users: await db.select().from(adminUsers),
      team_members: await db.select().from(teamMembers),
      posts: await db.select().from(posts),
    },
  };

  const counts = Object.fromEntries(Object.entries(data.tables).map(([name, rows]) => [name, rows.length]));
  const gz = gzipSync(Buffer.from(JSON.stringify(data)));
  const stamp = data.createdAt.slice(0, 16).replace(/[-:]/g, "").replace("T", "-");
  const name = `db-${stamp}.json.gz`;

  if (localDir) {
    await mkdir(localDir, { recursive: true });
    await writeFile(path.join(localDir, name), gz);
    console.log(`Saved ${name} (${gz.byteLength} bytes) in ${localDir}`, counts);
    return;
  }

  await putObject(`backups/${name}`, new Uint8Array(gz), "application/gzip");
  console.log(`Uploaded backups/${name} (${gz.byteLength} bytes)`, counts);

  const all = (await listObjects("backups/")).sort((a, b) => b.key.localeCompare(a.key));
  for (const old of all.slice(KEEP)) {
    await deleteObject(old.key);
    console.log("Deleted old backup", old.key);
  }
  console.log(`Backups kept: ${Math.min(all.length, KEEP)}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
