import { directory } from "@/content/ta-LK";
import type { SettingsValues } from "@/lib/settings";

// The registry is hidden from visitors until the admin switches it on (Settings > Registry page).
export function directoryEnabled(settings: SettingsValues) {
  return settings.directory_enabled === "1";
}

// Registrations can be closed for a while without hiding the list.
export function directoryOpen(settings: SettingsValues) {
  return settings.directory_open !== "0";
}

// The words on the pages: what the admin wrote, or the standard wording when it is empty.
export function directoryTexts(settings: SettingsValues) {
  const pick = (key: string, fallback: string) => settings[key]?.trim() || fallback;
  const lines = (settings.directory_why ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return {
    title: pick("directory_title", directory.title),
    lead: pick("directory_lead", directory.listLead),
    registerTitle: pick("directory_register_title", directory.registerTitle),
    registerLead: pick("directory_register_lead", directory.registerLead),
    whyTitle: pick("directory_why_title", directory.whyTitle),
    why: lines.length > 0 ? lines : [...directory.why],
    privacy: pick("directory_privacy", directory.privacy),
    consent: pick("directory_consent", directory.consent),
    thanks: pick("directory_thanks", directory.thanks),
    closed: pick("directory_closed", directory.closed),
  };
}
