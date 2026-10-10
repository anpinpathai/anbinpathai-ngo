import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { adminUsers, categories, posts, siteSettings, teamMembers } from "../db/schema";
import { backupStore } from "./lib/r2";

config({ path: ".env.local", quiet: true });

type Row = Record<string, unknown>;
type Backup = { version: number; createdAt: string; tables: Record<string, Row[]> };

function revive(rows: Row[], dateColumns: string[]) {
  return rows.map((row) => {
    const copy = { ...row };
    for (const col of dateColumns) if (typeof copy[col] === "string") copy[col] = new Date(copy[col] as string);
    return copy;
  });
}

async function load(source: string): Promise<Backup> {
  const bytes = source.startsWith("backups/") ? await backupStore.getObject(source) : await readFile(source);
  return JSON.parse(gunzipSync(Buffer.from(bytes)).toString("utf8")) as Backup;
}

async function main() {
  const source = process.argv[2];
  if (!source || source.startsWith("--")) {
    throw new Error("Usage: npm run restore -- <backups/db-....json.gz | local-file.json.gz> [--yes]");
  }
  const apply = process.argv.includes("--yes");

  const backup = await load(source);
  if (backup.version !== 1) throw new Error(`Unsupported backup version ${backup.version}`);
  const t = backup.tables;
  console.log(`Backup from ${backup.createdAt}:`, Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v.length])));

  if (!apply) {
    console.log("Dry run only. Add --yes to replace the live database content with this backup.");
    return;
  }

  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL_UNPOOLED is not set.");
  const db = drizzle(neon(url));

  const queries = [
    db.delete(posts),
    db.delete(teamMembers),
    db.delete(adminUsers),
    db.delete(siteSettings),
    db.delete(categories),
  ] as const;
  const inserts = [
    t.categories?.length ? db.insert(categories).values(revive(t.categories, []) as never) : null,
    t.site_settings?.length ? db.insert(siteSettings).values(revive(t.site_settings, []) as never) : null,
    t.admin_users?.length ? db.insert(adminUsers).values(revive(t.admin_users, ["createdAt"]) as never) : null,
    t.team_members?.length ? db.insert(teamMembers).values(revive(t.team_members, []) as never) : null,
    t.posts?.length
      ? db.insert(posts).values(revive(t.posts, ["publishedAt", "createdAt", "updatedAt"]) as never)
      : null,
  ].filter((q): q is NonNullable<typeof q> => q !== null);

  const fixSequences = ["categories", "admin_users", "team_members", "posts"].map((table) =>
    db.execute(
      sql.raw(
        `select setval(pg_get_serial_sequence('${table}', 'id'), coalesce(max(id), 1), max(id) is not null) from ${table}`,
      ),
    ),
  );

  await db.batch([...queries, ...inserts, ...fixSequences] as unknown as [(typeof queries)[number], ...(typeof queries)[number][]]);
  console.log("Restore finished. The database now matches the backup.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
