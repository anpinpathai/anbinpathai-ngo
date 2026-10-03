import "server-only";
import { sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { admin, settingGroups, type SettingField } from "@/content/admin-en";
import { isValidKey } from "@/lib/storage";
import { FACEBOOK_HOSTS, isHttpsUrlOnHosts, YOUTUBE_HOSTS } from "@/lib/urls";

export const settingFields: readonly SettingField[] = settingGroups.flatMap((g) => g.fields);

export type SettingsValues = Record<string, string>;
export type SettingsErrors = Record<string, string>;

export const getSettings = cache(async (): Promise<SettingsValues> => {
  const rows = await db.select().from(siteSettings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

export function validateSettings(input: SettingsValues, fields: readonly SettingField[] = settingFields) {
  const values: SettingsValues = {};
  const errors: SettingsErrors = {};

  for (const field of fields) {
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
        if (!isHttpsUrlOnHosts(value, FACEBOOK_HOSTS)) {
          errors[field.key] = admin.settings.errors.facebook;
        }
        break;
      case "youtube":
        if (!isHttpsUrlOnHosts(value, YOUTUBE_HOSTS)) {
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

// Saves only the given fields, so saving one settings page never touches another page's values.
export async function saveSettings(values: SettingsValues, fields: readonly SettingField[] = settingFields) {
  const rows = fields.map((f) => ({ key: f.key, value: values[f.key] ?? "" }));
  await db
    .insert(siteSettings)
    .values(rows)
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: sql`excluded.value` } });
}
