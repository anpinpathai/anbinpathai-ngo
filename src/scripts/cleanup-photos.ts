import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { deleteObject, listObjects } from "./lib/r2";

config({ path: ".env.local", quiet: true });

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL_UNPOOLED is not set.");
  const sql = neon(url);

  const apply = process.argv.includes("--delete");
  const ageIndex = process.argv.indexOf("--min-age-hours");
  const minAgeHours = ageIndex >= 0 ? Number(process.argv[ageIndex + 1]) : 24;
  if (!Number.isFinite(minAgeHours) || minAgeHours < 0) throw new Error("--min-age-hours must be a number.");

  const [galleries, members, settings] = await Promise.all([
    sql`select unnest(gallery_keys) as key from posts`,
    sql`select photo_key as key from team_members where photo_key is not null`,
    sql`select value as key from site_settings where key = 'home_banner' and value <> ''`,
  ]);
  const referenced = new Set([...galleries, ...members, ...settings].map((r) => r.key as string));

  const stored = await listObjects("uploads/");
  const cutoff = Date.now() - minAgeHours * 3600 * 1000;
  const orphans = stored.filter((o) => !referenced.has(o.key) && o.lastModified.getTime() <= cutoff);
  const bytes = orphans.reduce((sum, o) => sum + o.size, 0);

  console.log(
    `Files in storage: ${stored.length} | in use: ${referenced.size} | unused and older than ${minAgeHours}h: ${orphans.length} (${(bytes / 1024).toFixed(0)} KB)`,
  );
  for (const o of orphans) console.log(" ", o.key);

  if (!apply) {
    console.log(orphans.length ? "Nothing deleted. Add --delete to remove these files." : "Nothing to clean up.");
    return;
  }
  for (const o of orphans) await deleteObject(o.key);
  console.log(`Deleted ${orphans.length} unused file(s).`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
