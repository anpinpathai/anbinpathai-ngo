"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { directoryAdmin } from "@/content/admin-directory-en";
import { DIRECTORY_FIELD_TYPES, DIRECTORY_VISIBILITIES, type DirectoryFieldType, type DirectoryVisibility } from "@/db/schema";
import { SECTIONS, type DirectoryFieldRow } from "@/lib/directory/config";
import {
  createCustomField,
  deleteCustomField,
  getField,
  moveField,
  patchFieldFlags,
  updateFieldDetails,
  type FieldFlagPatch,
} from "@/lib/directory/fields";
import { manyLines, oneLine } from "@/lib/directory/validate";
import { requireAdmin } from "@/lib/session";

const text = directoryAdmin.fields;

export type FieldResult = { ok: boolean; error?: string; field?: DirectoryFieldRow; id?: number };

function toOptions(raw: string) {
  const options = [...new Set(manyLines(raw).split("\n").map((o) => oneLine(o).slice(0, 80)).filter(Boolean))];
  return options.slice(0, 60);
}

// One switch of one question.
export async function setFieldFlagAction(id: number, patch: FieldFlagPatch): Promise<FieldResult> {
  await requireAdmin();

  const clean: FieldFlagPatch = {};
  if (typeof patch.onForm === "boolean") clean.onForm = patch.onForm;
  if (typeof patch.required === "boolean") clean.required = patch.required;
  if (typeof patch.filterable === "boolean") clean.filterable = patch.filterable;
  if (patch.visibility && (DIRECTORY_VISIBILITIES as readonly string[]).includes(patch.visibility)) {
    clean.visibility = patch.visibility as DirectoryVisibility;
  }

  try {
    const field = await patchFieldFlags(id, clean);
    if (!field) return { ok: false, error: text.saveFailed };
    return { ok: true, field: field as DirectoryFieldRow };
  } catch (err) {
    console.error("Changing a registry question failed:", err);
    return { ok: false, error: text.saveFailed };
  }
}

export async function saveFieldDetailsAction(
  id: number,
  input: { label: string; help: string; options: string; type?: string; section?: string },
): Promise<FieldResult> {
  await requireAdmin();

  const label = oneLine(input.label).slice(0, 150);
  if (!label) return { ok: false, error: text.needLabel };

  const type = (DIRECTORY_FIELD_TYPES as readonly string[]).includes(input.type ?? "") ? (input.type as DirectoryFieldType) : undefined;
  const section = SECTIONS.find((s) => s.key === input.section)?.key;
  const options = toOptions(input.options);

  try {
    const done = await updateFieldDetails(id, { label, help: oneLine(input.help).slice(0, 300), options, type, section });
    if (done === "options") return { ok: false, error: text.needOptions };
    return done ? { ok: true } : { ok: false, error: text.saveFailed };
  } catch (err) {
    console.error("Saving a registry question failed:", err);
    return { ok: false, error: text.saveFailed };
  }
}

export async function createFieldAction(input: {
  label: string;
  help: string;
  options: string;
  type: string;
  section: string;
  required: boolean;
  visibility: string;
}): Promise<FieldResult> {
  await requireAdmin();

  const label = oneLine(input.label).slice(0, 150);
  if (!label) return { ok: false, error: text.needLabel };

  const type = (DIRECTORY_FIELD_TYPES as readonly string[]).includes(input.type) ? (input.type as DirectoryFieldType) : "text";
  const section = SECTIONS.find((s) => s.key === input.section)?.key ?? "other";
  const visibility = (DIRECTORY_VISIBILITIES as readonly string[]).includes(input.visibility)
    ? (input.visibility as DirectoryVisibility)
    : "private";
  const options = toOptions(input.options);
  if ((type === "select" || type === "multiselect") && options.length < 2) return { ok: false, error: text.needOptions };

  try {
    const id = await createCustomField({
      label,
      help: oneLine(input.help).slice(0, 300),
      type,
      options: type === "select" || type === "multiselect" ? options : [],
      section,
      required: Boolean(input.required),
      visibility,
    });
    // The new question's number, so the page can take the admin straight to it.
    return { ok: true, id };
  } catch (err) {
    console.error("Adding a registry question failed:", err);
    return { ok: false, error: text.saveFailed };
  }
}

export async function moveFieldAction(id: number, direction: "up" | "down") {
  await requireAdmin();
  await moveField(id, direction === "up" ? "up" : "down");
  revalidatePath("/admin/directory/fields");
}

export async function deleteFieldAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  // Come back to the same group (tab) after deleting.
  const section = Number.isInteger(id) ? (await getField(id))?.section : undefined;
  if (Number.isInteger(id)) await deleteCustomField(id);
  redirect(`/admin/directory/fields?notice=deleted${section ? `&tab=${encodeURIComponent(section)}` : ""}`);
}
