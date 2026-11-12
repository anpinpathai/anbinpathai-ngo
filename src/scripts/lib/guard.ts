// A safety catch for commands that CHANGE or DELETE data (seed, migrate, restore, create-admin, photo clean-up).
//
// The live website and the test (staging) copy use different databases and different photo buckets. These commands
// only run when the database (and, for photo clean-up, the photo bucket) they point at is the one written in
// .env.local as the allowed one:
//
//   ALLOWED_DB_ENDPOINT=ep-xxxx-xxxx-xxxxxxxx      the Neon "ep-..." name of the STAGING branch
//   ALLOWED_R2_BUCKET=anpinpathai-media-staging    the STAGING photo bucket
//
// If those lines are missing or do not match, the command stops BEFORE touching anything. To change the live site on
// purpose, run the command again with --i-know-this-is-live.

export const LIVE_FLAG = "--i-know-this-is-live";

// "ep-holy-mouse-b3iems21-pooler.c-4.ap-southeast-1.aws.neon.tech" -> "ep-holy-mouse-b3iems21"
export function databaseEndpoint(url: string | undefined) {
  if (!url) return null;
  try {
    return new URL(url).hostname.split(".")[0].replace(/-pooler$/, "");
  } catch {
    return null;
  }
}

type Target = { database?: boolean; bucket?: boolean };
type Result = { ok: true; warning?: string } | { ok: false; message: string };

export function checkTarget(what: string, target: Target, env = process.env, argv = process.argv): Result {
  const problems: string[] = [];

  if (target.database) {
    const endpoint = databaseEndpoint(env.DATABASE_URL_UNPOOLED || env.DATABASE_URL);
    const allowed = env.ALLOWED_DB_ENDPOINT?.trim();
    if (!endpoint) problems.push("No database address was found (DATABASE_URL_UNPOOLED).");
    else if (!allowed) problems.push(`ALLOWED_DB_ENDPOINT is not set. The database this points at is "${endpoint}".`);
    else if (allowed !== endpoint) {
      problems.push(`This points at database "${endpoint}", but ALLOWED_DB_ENDPOINT says "${allowed}".`);
    }
  }

  if (target.bucket) {
    const bucket = env.R2_BUCKET?.trim();
    const allowed = env.ALLOWED_R2_BUCKET?.trim();
    if (!bucket || bucket.toLowerCase().startsWith("dummy")) problems.push("No photo bucket is set (R2_BUCKET).");
    else if (!allowed) problems.push(`ALLOWED_R2_BUCKET is not set. The photo bucket this points at is "${bucket}".`);
    else if (allowed !== bucket) {
      problems.push(`This points at photo bucket "${bucket}", but ALLOWED_R2_BUCKET says "${allowed}".`);
    }
  }

  if (problems.length === 0) return { ok: true };

  // The flag works for our own commands. "db:migrate" is run by drizzle-kit, which rejects flags it does not know,
  // so the same confirmation can also be given as the environment variable I_KNOW_THIS_IS_LIVE=yes.
  if (argv.includes(LIVE_FLAG) || env.I_KNOW_THIS_IS_LIVE === "yes") {
    return { ok: true, warning: `the live confirmation was given: "${what}" will run on a database or bucket that is not marked as safe.` };
  }

  return {
    ok: false,
    message: [
      `STOPPED: "${what}" changes data, and this computer is not set up to let it run here.`,
      ...problems.map((p) => `  - ${p}`),
      "",
      "If this is meant to be the STAGING (test) copy, put these two lines in .env.local:",
      "  ALLOWED_DB_ENDPOINT=<the ep-... name of the staging branch: Neon > branch staging > Connect>",
      "  ALLOWED_R2_BUCKET=<the staging photo bucket name>",
      `If you really mean to change the LIVE site, run the same command again with ${LIVE_FLAG}`,
      "(or, for db:migrate, set the environment variable I_KNOW_THIS_IS_LIVE=yes). See docs/environments.md.",
      "Nothing was changed.",
    ].join("\n"),
  };
}

// Used at the start of a command. Prints the reason and ends the command when it is not safe.
export function guardOrExit(what: string, target: Target = { database: true }) {
  const result = checkTarget(what, target);
  if (!result.ok) {
    console.error(result.message);
    process.exit(1);
  }
  if (result.warning) console.warn(`WARNING: ${result.warning}`);
}
