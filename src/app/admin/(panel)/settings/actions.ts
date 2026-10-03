"use server";

import { revalidatePath } from "next/cache";
import { admin, settingSections } from "@/content/admin-en";
import { requireAdmin } from "@/lib/session";
import {
  getSettings,
  saveSettings,
  validateSettings,
  type SettingsErrors,
  type SettingsValues,
} from "@/lib/settings";
import { deleteObject } from "@/lib/storage";

export type SettingsState = {
  status: "idle" | "saved" | "error";
  message?: string;
  values: SettingsValues;
  errors: SettingsErrors;
};

export async function saveSettingsAction(prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireAdmin();

  // Only the fields of the page being saved are read and written.
  const section = settingSections.find((s) => s.slug === formData.get("section"));
  if (!section) return { ...prev, status: "error", message: admin.settings.unknownSection, errors: {} };
  const fields = section.groups.flatMap((g) => g.fields);

  const input: SettingsValues = {};
  for (const field of fields) input[field.key] = String(formData.get(field.key) ?? "");

  const { values, errors, valid } = validateSettings(input, fields);
  if (!valid) return { status: "error", message: admin.settings.fixErrors, values, errors };

  const before = await getSettings();
  try {
    await saveSettings(values, fields);
  } catch (err) {
    console.error("Saving settings failed:", err);
    return { status: "error", message: admin.settings.saveFailed, values, errors: {} };
  }

  if ("home_banner" in values && before.home_banner && before.home_banner !== values.home_banner) {
    await deleteObject(before.home_banner).catch((err) => console.error("Deleting old banner failed:", err));
  }

  revalidatePath("/", "layout");
  return { status: "saved", message: admin.settings.saved, values, errors: {} };
}
