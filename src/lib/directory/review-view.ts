import "server-only";
import { RESIDENCE_ABROAD, RESIDENCE_LK, type DirectoryFieldRow } from "./config";
import { entryToValues, type EntryRow } from "./entries";
import { isPublicField } from "./public";
import type { ReviewRow, Verdict } from "./reviews";
import { FORM_UI_TA } from "./ui-text";

// What a reviewer may see of a person. Unless the admin allowed more, a reviewer sees only what the public would see:
// the answers marked "public" and the ones this person agreed to show. Email, phone and every other private answer
// stay hidden, on the screen and in the data sent to the browser.

type Allowed = Pick<ReviewRow, "canSeePrivate">;

export function fieldsFor(review: Allowed, all: readonly DirectoryFieldRow[], entry: EntryRow) {
  return all.filter((f) => review.canSeePrivate || isPublicField(f, entry));
}

export function photoShownFor(review: Allowed, all: readonly DirectoryFieldRow[], entry: EntryRow) {
  return review.canSeePrivate || isPublicField(all.find((f) => f.key === "photo"), entry);
}

// The place and the fields of art, for the list.
export function placeFor(review: Allowed, all: readonly DirectoryFieldRow[], entry: EntryRow) {
  const fields = new Map(all.map((f) => [f.key, f]));
  const shown = (key: string) => review.canSeePrivate || isPublicField(fields.get(key), entry);
  const part = (key: string, value: string) => (shown(key) && value ? [value] : []);
  const parts =
    entry.residence === RESIDENCE_ABROAD
      ? [...part("city", entry.city), ...part("country", entry.country)]
      : [...part("city", entry.city), ...part("ds_division", entry.dsDivision), ...part("district", entry.district)];
  return parts.join(", ");
}

export function artFor(review: Allowed, all: readonly DirectoryFieldRow[], entry: EntryRow) {
  return review.canSeePrivate || isPublicField(all.find((f) => f.key === "art_fields"), entry) ? entry.artFields : [];
}

// The answers as plain text, for the reviewer to read.
export function answerList(entry: EntryRow, fields: readonly DirectoryFieldRow[]) {
  const values = entryToValues(entry);
  const rows: { key: string; label: string; value: string }[] = [];
  for (const field of fields) {
    if (field.type === "photo") continue;
    const raw = values[field.key];
    let value = Array.isArray(raw) ? raw.join(", ") : (raw ?? "");
    if (field.key === "residence") value = value === RESIDENCE_LK ? FORM_UI_TA.residenceLk : value === RESIDENCE_ABROAD ? FORM_UI_TA.residenceAbroad : value;
    if (!value) continue;
    rows.push({ key: field.key, label: field.label, value });
  }
  return rows;
}

// Where a person stands for this reviewer: still to look at, already answered by this reviewer (good or fix), or already
// decided by the admin, which closes it.
export type ReviewRowState = "todo" | "good" | "fix" | "decided";

export function isOpen(entry: Pick<EntryRow, "status">) {
  return entry.status === "pending" || entry.status === "update_needed";
}

export function rowState(entry: Pick<EntryRow, "status">, verdict: Verdict | undefined): ReviewRowState {
  if (verdict) return verdict.action === "recommend_approve" ? "good" : "fix";
  return isOpen(entry) ? "todo" : "decided";
}
