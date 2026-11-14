import "server-only";
import { and, arrayContains, asc, count, desc, eq, ilike, inArray, isNull, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  directoryActivity,
  directoryEntries,
  type DirectoryStatus,
} from "@/db/schema";
import { COLUMN_FIELDS, formatCode, type DirectoryFieldRow, type EntryValues } from "./config";

export type EntryRow = typeof directoryEntries.$inferSelect;

function isUniqueViolation(err: unknown) {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

// ---------------------------------------------------------------------------------------------------------------
// Entry <-> the answers of a form
// ---------------------------------------------------------------------------------------------------------------

// All the answers of an entry as one flat list (the way the form handles them).
export function entryToValues(entry: EntryRow): EntryValues {
  return {
    ...entry.answers,
    name: entry.name,
    photo: entry.photoKey ?? "",
    art_fields: entry.artFields,
    residence: entry.residence,
    country: entry.country,
    district: entry.district,
    ds_division: entry.dsDivision,
    gn_division: entry.gnDivision,
    postal_code: entry.postalCode,
    city: entry.city,
    native_district: entry.nativeDistrict,
  };
}

type Columns = Partial<typeof directoryEntries.$inferInsert>;

// Splits the answers into the entry's own columns and the "everything else" box.
function splitValues(values: EntryValues) {
  const columns: Record<string, unknown> = {};
  const answers: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(values)) {
    const column = (COLUMN_FIELDS as Record<string, string>)[key];
    if (!column) {
      answers[key] = value;
    } else if (column === "photoKey") {
      columns[column] = String(value) || null;
    } else {
      columns[column] = value;
    }
  }
  return { columns: columns as Columns, answers };
}

function same(a: string | string[] | undefined, b: string | string[] | undefined) {
  return JSON.stringify(a ?? "") === JSON.stringify(b ?? "");
}

// The names of the questions whose answer changed, for the activity trail.
export function changedLabels(before: EntryValues, after: EntryValues, fields: readonly DirectoryFieldRow[]) {
  return fields
    .filter((f) => f.key in after && !same(before[f.key] === "" ? "" : before[f.key], after[f.key] === "" ? "" : after[f.key]))
    .map((f) => f.label);
}

// ---------------------------------------------------------------------------------------------------------------
// Activity trail
// ---------------------------------------------------------------------------------------------------------------

export async function logActivity(entryId: number, actor: string, action: string, detail = "", reviewId: number | null = null) {
  await db.insert(directoryActivity).values({ entryId, actor, action, detail: detail.slice(0, 1000), reviewId });
}

// Several lines for the activity trail in one go (for example when many people are sent to a reviewer).
export async function logActivityMany(rows: { entryId: number; actor: string; action: string; detail?: string; reviewId?: number | null }[]) {
  if (rows.length === 0) return;
  await db.insert(directoryActivity).values(
    rows.map((row) => ({
      entryId: row.entryId,
      actor: row.actor,
      action: row.action,
      detail: (row.detail ?? "").slice(0, 1000),
      reviewId: row.reviewId ?? null,
    })),
  );
}

export function listActivity(entryId: number) {
  return db.select().from(directoryActivity).where(eq(directoryActivity.entryId, entryId)).orderBy(desc(directoryActivity.createdAt), desc(directoryActivity.id));
}

// ---------------------------------------------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------------------------------------------

export async function getEntry(id: number) {
  const [row] = await db.select().from(directoryEntries).where(eq(directoryEntries.id, id)).limit(1);
  return row ?? null;
}

export function getEntries(ids: number[]) {
  if (ids.length === 0) return Promise.resolve([] as EntryRow[]);
  return db.select().from(directoryEntries).where(inArray(directoryEntries.id, ids)).orderBy(asc(directoryEntries.submittedAt));
}

export const ADMIN_PER_PAGE = 25;

export type AdminFilters = {
  status?: DirectoryStatus;
  q?: string;
  scope?: "lk" | "abroad";
  country?: string;
  district?: string;
  field?: string;
  page: number;
};

function escapeLike(text: string) {
  return text.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export async function listAdminEntries(filters: AdminFilters) {
  const conditions: (SQL | undefined)[] = [
    filters.status ? eq(directoryEntries.status, filters.status) : undefined,
    filters.q ? ilike(directoryEntries.name, `%${escapeLike(filters.q)}%`) : undefined,
    filters.scope ? eq(directoryEntries.residence, filters.scope) : undefined,
    filters.country ? eq(directoryEntries.country, filters.country) : undefined,
    filters.district ? eq(directoryEntries.district, filters.district) : undefined,
    filters.field ? arrayContains(directoryEntries.artFields, [filters.field]) : undefined,
  ];
  const where = and(...conditions);

  const [rows, [total]] = await Promise.all([
    db
      .select()
      .from(directoryEntries)
      .where(where)
      .orderBy(desc(directoryEntries.submittedAt), desc(directoryEntries.id))
      .limit(ADMIN_PER_PAGE)
      .offset((filters.page - 1) * ADMIN_PER_PAGE),
    db.select({ n: count() }).from(directoryEntries).where(where),
  ]);
  return { rows, total: total?.n ?? 0 };
}

export async function statusCounts() {
  const rows = await db.select({ status: directoryEntries.status, n: count() }).from(directoryEntries).groupBy(directoryEntries.status);
  const counts: Record<DirectoryStatus | "all", number> = { all: 0, pending: 0, approved: 0, update_needed: 0, rejected: 0, withdrawn: 0 };
  for (const row of rows) {
    counts[row.status] = row.n;
    counts.all += row.n;
  }
  return counts;
}

// Does another entry already use this email address? Used to warn the admin about a possible duplicate.
export async function findOtherWithEmail(email: string, exceptId: number) {
  if (!email) return null;
  const [row] = await db
    .select({ id: directoryEntries.id, name: directoryEntries.name })
    .from(directoryEntries)
    .where(and(sql`lower(${directoryEntries.answers}->>'email') = ${email.toLowerCase()}`, sql`${directoryEntries.id} <> ${exceptId}`))
    .limit(1);
  return row ?? null;
}

// ---------------------------------------------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------------------------------------------

export type NewEntry = {
  values: EntryValues;
  shares: Record<string, boolean>;
  source: "public" | "admin";
  status: DirectoryStatus;
  consentText: string;
  actor: string;
};

export async function createEntry(input: NewEntry) {
  const { columns, answers } = splitValues(input.values);
  const now = new Date();

  const [row] = await db
    .insert(directoryEntries)
    .values({
      ...columns,
      name: String(input.values.name ?? ""),
      answers,
      shareChoices: input.shares,
      source: input.source,
      status: input.status,
      consentAt: input.source === "public" ? now : null,
      consentText: input.consentText,
      reviewedAt: input.status === "approved" ? now : null,
      publishedAt: input.status === "approved" ? now : null,
    })
    .returning({ id: directoryEntries.id });

  await logActivity(row.id, input.actor, input.source === "public" ? "submitted" : "created");
  if (input.status === "approved") {
    await assignCode(row.id);
    await logActivity(row.id, input.actor, "approved", "Published when it was added");
  }
  return row.id;
}

// Saves changed answers. `values` holds only the questions the person was allowed to change; the rest is kept.
export async function updateEntryValues(
  id: number,
  values: EntryValues,
  shares: Record<string, boolean>,
  fields: readonly DirectoryFieldRow[],
  actor: string,
  reviewId: number | null = null,
) {
  const entry = await getEntry(id);
  if (!entry) return false;

  const before = entryToValues(entry);
  const { columns, answers } = splitValues(values);
  const changed = changedLabels(before, values, fields);

  await db
    .update(directoryEntries)
    .set({
      ...columns,
      answers: { ...entry.answers, ...answers },
      shareChoices: { ...entry.shareChoices, ...shares },
      updatedAt: new Date(),
    })
    .where(eq(directoryEntries.id, id));

  if (changed.length > 0) await logActivity(id, actor, "edited", `Changed: ${changed.join(", ")}`, reviewId);
  return true;
}

export async function updateAdminNote(id: number, note: string) {
  await db.update(directoryEntries).set({ adminNote: note.slice(0, 2000), updatedAt: new Date() }).where(eq(directoryEntries.id, id));
}

async function nextCodeNumber() {
  const [row] = await db
    .select({ top: sql<number>`coalesce(max(substring(${directoryEntries.code} from 8)::int), 0)` })
    .from(directoryEntries)
    .where(sql`${directoryEntries.code} is not null`);
  return Number(row?.top ?? 0) + 1;
}

// Gives the entry its AP-ART number, once. If two are approved at the same moment, the second tries again.
async function assignCode(id: number) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = formatCode(await nextCodeNumber());
    try {
      const rows = await db
        .update(directoryEntries)
        .set({ code })
        .where(and(eq(directoryEntries.id, id), isNull(directoryEntries.code)))
        .returning({ code: directoryEntries.code });
      return rows[0]?.code ?? null;
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
    }
  }
  throw new Error("Could not give the entry a registry number.");
}

export async function approveEntry(id: number, actor: string) {
  const entry = await getEntry(id);
  if (!entry) return null;

  const now = new Date();
  if (!entry.code) await assignCode(id);
  await db
    .update(directoryEntries)
    .set({ status: "approved", statusReason: "", reviewedAt: now, publishedAt: entry.publishedAt ?? now, updatedAt: now })
    .where(eq(directoryEntries.id, id));
  await logActivity(id, actor, "approved");
  return true;
}

export async function setEntryStatus(id: number, status: Exclude<DirectoryStatus, "approved">, reason: string, actor: string) {
  const entry = await getEntry(id);
  if (!entry) return null;

  await db
    .update(directoryEntries)
    .set({ status, statusReason: reason.slice(0, 1000), reviewedAt: new Date(), updatedAt: new Date() })
    .where(eq(directoryEntries.id, id));
  await logActivity(id, actor, status, reason);
  return true;
}

export async function deleteEntry(id: number) {
  const [row] = await db.delete(directoryEntries).where(eq(directoryEntries.id, id)).returning({ photoKey: directoryEntries.photoKey });
  return row ?? null;
}

export async function referencedPhotoKeys() {
  const rows = await db.select({ key: directoryEntries.photoKey }).from(directoryEntries).where(sql`${directoryEntries.photoKey} is not null`);
  return rows.map((r) => r.key as string);
}
