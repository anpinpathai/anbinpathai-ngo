import "server-only";
import { sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { admin, settingGroups, type SettingField } from "@/content/admin-en";
import { isValidKey } from "@/lib/storage";

export const settingFields: readonly SettingField[] = settingGroups.flatMap((g) => g.fields);

export type SettingsValues = Record<string, string>;
export type SettingsErrors = Record<string, string>;

export const getSettings = cache(async (): Promise<SettingsValues> => {
  const rows = await db.select().from(siteSettings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

function isHttpsUrlOnHosts(value: string, hosts: string[]) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return hosts.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export function validateSettings(input: SettingsValues) {
  const values: SettingsValues = {};
  const errors: SettingsErrors = {};

  for (const field of settingFields) {
    const value = (input[field.key] ?? "").trim();
    values[field.key] = value;
    if (!value) continue;

    if (value.length > field.maxLength) {
      errors[field.key] = admin.settings.tooLong(field.maxLength);
      continue;
    }

    switch (field.type) {
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[field.key] = admin.settings.errors.email;
        break;
      case "tel":
        if (!/^[0-9+()\-\s]{6,40}$/.test(value)) errors[field.key] = admin.settings.errors.phone;
        break;
      case "facebook":
        if (!isHttpsUrlOnHosts(value, ["facebook.com", "fb.com", "fb.me"])) {
          errors[field.key] = admin.settings.errors.facebook;
        }
        break;
      case "youtube":
        if (!isHttpsUrlOnHosts(value, ["youtube.com", "youtu.be"])) {
          errors[field.key] = admin.settings.errors.youtube;
        }
        break;
      case "image":
        if (!isValidKey(value)) errors[field.key] = admin.settings.errors.image;
        break;
    }
  }

  return { values, errors, valid: Object.keys(errors).length === 0 };
}

export async function saveSettings(values: SettingsValues) {
  const rows = settingFields.map((f) => ({ key: f.key, value: values[f.key] ?? "" }));
  await db
    .insert(siteSettings)
    .values(rows)
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: sql`excluded.value` } });
}
