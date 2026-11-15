"use server";

import { createEntry, findOtherWithEmail, logActivity } from "@/lib/directory/entries";
import { listFields } from "@/lib/directory/fields";
import type { EntryFormState } from "@/lib/directory/form-state";
import {
  FORM_TOKEN_FIELD,
  HONEYPOT_FIELD,
  SUBMIT_LIMIT,
  checkFormToken,
  countOne,
  tooMany,
  visitorKey,
} from "@/lib/directory/spam";
import { directoryEnabled, directoryOpen, directoryTexts } from "@/lib/directory/text";
import { FORM_UI_TA } from "@/lib/directory/ui-text";
import { readEntryForm, validateEntry } from "@/lib/directory/validate";
import { getSettings } from "@/lib/settings";

// The public registration form. Nothing is shown to visitors until the admin approves the entry.
export async function submitEntryAction(_prev: EntryFormState, formData: FormData): Promise<EntryFormState> {
  const ui = FORM_UI_TA;
  const settings = await getSettings();
  const text = directoryTexts(settings);

  const fields = (await listFields()).filter((f) => f.onForm);
  const raw = readEntryForm(formData, fields);
  // Whatever goes wrong, give the person back what they typed, so nothing is lost.
  const keep = (message: string, errors: Record<string, string> = {}): EntryFormState => ({
    status: "error",
    message,
    values: raw.values,
    shares: raw.shares,
    errors,
  });

  if (!directoryEnabled(settings) || !directoryOpen(settings)) return keep(text.closed);

  // A robot fills in the hidden box: pretend it worked and save nothing.
  if (String(formData.get(HONEYPOT_FIELD) ?? "") !== "") {
    return { status: "submitted", message: text.thanks, values: {}, shares: {}, errors: {} };
  }

  const opened = checkFormToken(String(formData.get(FORM_TOKEN_FIELD) ?? ""));
  if (opened === "too_fast") return keep("சில விநாடிகள் கழித்து மீண்டும் அனுப்புங்கள்.");
  if (opened !== "ok") return keep("இந்தப் பக்கம் பழையதாகிவிட்டது. பக்கத்தை மீண்டும் ஏற்றி (refresh) முயற்சிக்கவும்.");

  const key = await visitorKey("submit");
  if (await tooMany(key, SUBMIT_LIMIT)) return keep(ui.tooMany);

  const clean = validateEntry(raw, fields, "public");
  const errors = { ...clean.errors };
  if (formData.get("consent") !== "1") errors.consent = ui.consentRequired;
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: ui.fixErrors, values: clean.values, shares: clean.shares, errors };
  }

  await countOne(key);

  try {
    const id = await createEntry({
      values: clean.values,
      shares: clean.shares,
      source: "public",
      status: "pending",
      consentText: text.consent,
      actor: "applicant",
    });

    // A second entry with the same email is allowed, but the admin gets a hint.
    const email = typeof clean.values.email === "string" ? clean.values.email : "";
    const other = await findOtherWithEmail(email, id).catch(() => null);
    if (other) await logActivity(id, "system", "note", `Same email address as entry #${other.id} (${other.name}). It may be a duplicate.`);
  } catch (err) {
    console.error("Saving a registry entry failed:", err);
    return keep(ui.failed);
  }

  return { status: "submitted", message: text.thanks, values: {}, shares: {}, errors: {} };
}
