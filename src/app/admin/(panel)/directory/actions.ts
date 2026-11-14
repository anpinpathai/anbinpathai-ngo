"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { directoryAdmin } from "@/content/admin-directory-en";
import {
  approveEntry,
  createEntry,
  deleteEntry,
  getEntry,
  setEntryStatus,
  updateAdminNote,
  updateEntryValues,
} from "@/lib/directory/entries";
import { listFields } from "@/lib/directory/fields";
import type { EntryFormState } from "@/lib/directory/form-state";
import { readEntryForm, validateEntry } from "@/lib/directory/validate";
import { requireAdmin } from "@/lib/session";
import { deleteObjects } from "@/lib/storage";

const text = directoryAdmin;

function toId(value: FormDataEntryValue | null) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// The sitemap changes whenever someone is approved, hidden or removed.
function refreshPublic() {
  revalidatePath("/sitemap.xml");
}

export async function saveEntryAction(_prev: EntryFormState, formData: FormData): Promise<EntryFormState> {
  await requireAdmin();

  const id = toId(formData.get("id"));
  const fields = await listFields();
  const raw = readEntryForm(formData, fields);
  const clean = validateEntry(raw, fields, "admin");
  const failed = (message: string, errors: Record<string, string> = {}): EntryFormState => ({
    status: "error",
    message,
    values: clean.values,
    shares: clean.shares,
    errors,
  });

  if (Object.keys(clean.errors).length > 0) return failed("Please fix the highlighted answers and try again.", clean.errors);

  const entry = id ? await getEntry(id) : null;
  if (!id || !entry) return failed(text.detail.notFound);

  try {
    await updateEntryValues(id, clean.values, clean.shares, fields, "admin");
    const newPhoto = typeof clean.values.photo === "string" ? clean.values.photo : "";
    if (entry.photoKey && entry.photoKey !== newPhoto) await deleteObjects([entry.photoKey]);
  } catch (err) {
    console.error("Saving a registry entry failed:", err);
    return failed("Could not save. Please try again.");
  }

  refreshPublic();
  return { status: "saved", message: text.detail.saved, values: clean.values, shares: clean.shares, errors: {} };
}

export async function createEntryAction(_prev: EntryFormState, formData: FormData): Promise<EntryFormState> {
  await requireAdmin();

  const fields = await listFields();
  const raw = readEntryForm(formData, fields);
  const clean = validateEntry(raw, fields, "admin");
  if (Object.keys(clean.errors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted answers and try again.",
      values: clean.values,
      shares: clean.shares,
      errors: clean.errors,
    };
  }

  let id: number;
  try {
    id = await createEntry({
      values: clean.values,
      shares: clean.shares,
      source: "admin",
      status: formData.get("publish") === "1" ? "approved" : "pending",
      consentText: "",
      actor: "admin",
    });
  } catch (err) {
    console.error("Adding a registry entry failed:", err);
    return { status: "error", message: "Could not save. Please try again.", values: clean.values, shares: clean.shares, errors: {} };
  }

  refreshPublic();
  redirect(`/admin/directory/${id}?notice=created`);
}

export async function approveEntryAction(formData: FormData) {
  await requireAdmin();
  const id = toId(formData.get("id"));
  if (id) {
    await approveEntry(id, "admin");
    refreshPublic();
  }
  redirect(id ? `/admin/directory/${id}?notice=approved` : "/admin/directory");
}

const CHANGEABLE = ["update_needed", "rejected", "withdrawn", "pending"] as const;

export async function statusEntryAction(formData: FormData) {
  await requireAdmin();
  const id = toId(formData.get("id"));
  const status = CHANGEABLE.find((s) => s === formData.get("status"));
  if (id && status) {
    await setEntryStatus(id, status, String(formData.get("reason") ?? "").trim(), "admin");
    refreshPublic();
  }
  redirect(id ? `/admin/directory/${id}?notice=${status ?? "saved"}` : "/admin/directory");
}

export async function saveNoteAction(formData: FormData) {
  await requireAdmin();
  const id = toId(formData.get("id"));
  if (id) await updateAdminNote(id, String(formData.get("note") ?? "").trim());
  // Back to the same tab ("tab=note"), so the page does not jump to the answers after saving a note.
  redirect(id ? `/admin/directory/${id}?notice=note&tab=note` : "/admin/directory");
}

export async function deleteEntryAction(formData: FormData) {
  await requireAdmin();
  const id = toId(formData.get("id"));
  if (id) {
    const removed = await deleteEntry(id);
    if (removed?.photoKey) await deleteObjects([removed.photoKey]);
    refreshPublic();
  }
  redirect("/admin/directory?notice=deleted");
}
