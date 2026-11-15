import "server-only";
import { count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { directoryEntries, directoryFields, type DirectoryFieldType, type DirectoryVisibility } from "@/db/schema";
import {
  ALWAYS_ON_KEYS,
  ALWAYS_PUBLIC_KEYS,
  DEFAULT_FIELDS,
  sectionIndex,
  type DirectoryFieldRow,
} from "./config";

// The first time the registry is used (and whenever a new built-in question is added in the code), the starting
// questions are written to the database. Questions that already exist are never overwritten.
export async function ensureDefaultFields() {
  const [row] = await db.select({ n: count() }).from(directoryFields);
  if ((row?.n ?? 0) >= DEFAULT_FIELDS.length) return;

  await db
    .insert(directoryFields)
    .values(DEFAULT_FIELDS.map((f, index) => ({ ...f, builtin: true, sortOrder: (index + 1) * 10 })))
    .onConflictDoNothing({ target: directoryFields.key });
}

function sorted(rows: DirectoryFieldRow[]) {
  return [...rows].sort((a, b) => sectionIndex(a.section) - sectionIndex(b.section) || a.sortOrder - b.sortOrder || a.id - b.id);
}

// Every question, in the order shown on the form.
export async function listFields(): Promise<DirectoryFieldRow[]> {
  await ensureDefaultFields();
  return sorted(await db.select().from(directoryFields));
}

export async function getField(id: number) {
  const [row] = await db.select().from(directoryFields).where(eq(directoryFields.id, id)).limit(1);
  return row ?? null;
}

export type FieldFlagPatch = Partial<{
  onForm: boolean;
  required: boolean;
  filterable: boolean;
  visibility: DirectoryVisibility;
}>;

// Applies one switch. The rules that keep the registry working are enforced here, not only in the screen.
export async function patchFieldFlags(id: number, patch: FieldFlagPatch) {
  const field = await getField(id);
  if (!field) return null;

  const next = {
    onForm: patch.onForm ?? field.onForm,
    required: patch.required ?? field.required,
    filterable: patch.filterable ?? field.filterable,
    visibility: patch.visibility ?? field.visibility,
  };

  if ((ALWAYS_ON_KEYS as readonly string[]).includes(field.key)) {
    next.onForm = true;
    next.required = true;
  }
  if ((ALWAYS_PUBLIC_KEYS as readonly string[]).includes(field.key)) next.visibility = "public";
  // A question that is not on the form cannot be required.
  if (!next.onForm) next.required = false;
  // A filter must never reveal something that is not public.
  if (next.visibility !== "public") next.filterable = false;
  // Only some kinds of question make sense as a filter.
  const filterTypes: DirectoryFieldType[] = ["select", "multiselect", "text"];
  if (!filterTypes.includes(field.type)) next.filterable = false;

  await db.update(directoryFields).set(next).where(eq(directoryFields.id, id));
  return { ...field, ...next };
}

export type FieldDetails = {
  label: string;
  help: string;
  options: string[];
  type?: DirectoryFieldType;
  section?: string;
};

// Returns false when the question does not exist, "options" when a pick-from-a-list question would be left with
// fewer than two choices, and true when it was saved.
export async function updateFieldDetails(id: number, details: FieldDetails): Promise<boolean | "options"> {
  const field = await getField(id);
  if (!field) return false;

  // The kind of answer and its group can only be changed for questions the admin added.
  const type = !field.builtin && details.type ? details.type : field.type;
  const isList = type === "select" || type === "multiselect";
  // "residence" is a pick-from-a-list question with its own built-in choices, so it has no list to edit.
  if (isList && field.key !== "residence" && details.options.length < 2) return "options";

  const set: Partial<typeof directoryFields.$inferInsert> = { label: details.label, help: details.help };
  if (isList && field.key !== "residence") set.options = details.options;
  if (!field.builtin) {
    set.type = type;
    if (!isList) set.options = [];
    if (details.section) set.section = details.section;
  }
  await db.update(directoryFields).set(set).where(eq(directoryFields.id, id));
  return true;
}

function newKey() {
  return `c_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

export async function createCustomField(input: {
  label: string;
  help: string;
  type: DirectoryFieldType;
  options: string[];
  section: string;
  required: boolean;
  visibility: DirectoryVisibility;
}) {
  const all = await listFields();
  const inSection = all.filter((f) => f.section === input.section);
  const sortOrder = (inSection.at(-1)?.sortOrder ?? 0) + 10;
  const filterable = false;

  const [row] = await db
    .insert(directoryFields)
    .values({
      key: newKey(),
      label: input.label,
      help: input.help,
      type: input.type,
      options: input.options,
      section: input.section,
      required: input.required,
      onForm: true,
      visibility: input.visibility,
      filterable,
      builtin: false,
      sortOrder,
    })
    .returning({ id: directoryFields.id });
  return row.id;
}

// Deletes a question the admin added, and the answers people gave to it.
export async function deleteCustomField(id: number) {
  const field = await getField(id);
  if (!field || field.builtin) return false;

  await db.batch([
    db
      .update(directoryEntries)
      .set({
        answers: sql`${directoryEntries.answers} - ${field.key}::text`,
        shareChoices: sql`${directoryEntries.shareChoices} - ${field.key}::text`,
      })
      .where(sql`jsonb_exists(${directoryEntries.answers}, ${field.key}) or jsonb_exists(${directoryEntries.shareChoices}, ${field.key})`),
    db.delete(directoryFields).where(eq(directoryFields.id, id)),
  ]);
  return true;
}

// Swaps a question with its neighbour inside the same group.
export async function moveField(id: number, direction: "up" | "down") {
  const all = await listFields();
  const field = all.find((f) => f.id === id);
  if (!field) return;

  const group = all.filter((f) => f.section === field.section);
  const index = group.findIndex((f) => f.id === id);
  const otherIndex = direction === "up" ? index - 1 : index + 1;
  if (otherIndex < 0 || otherIndex >= group.length) return;

  // Give every question in the group a clean, distinct order, so equal numbers can never cause a mix-up.
  const order = group.map((f) => f.id);
  [order[index], order[otherIndex]] = [order[otherIndex], order[index]];
  for (const [position, fieldId] of order.entries()) {
    await db.update(directoryFields).set({ sortOrder: (position + 1) * 10 }).where(eq(directoryFields.id, fieldId));
  }
}
