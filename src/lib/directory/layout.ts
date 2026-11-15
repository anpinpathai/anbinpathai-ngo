import type { DirectoryFieldRow } from "./config";

// Long answer boxes (and the photo) always take the whole row.
export function isWide(field: DirectoryFieldRow) {
  return field.type === "textarea" || field.type === "links" || field.type === "multiselect" || field.type === "photo";
}

// Two short questions sit side by side. A question that would stand alone in its row (the last one of a group, or one
// next to a long box) takes the whole row instead, so a row is never left half empty.
export function fullWidthKeys(fields: readonly DirectoryFieldRow[]) {
  const full = new Set<string>();
  let waiting: DirectoryFieldRow | null = null;
  for (const field of fields) {
    if (isWide(field)) {
      if (waiting) full.add(waiting.key);
      waiting = null;
      full.add(field.key);
    } else if (waiting) {
      waiting = null;
    } else {
      waiting = field;
    }
  }
  if (waiting) full.add(waiting.key);
  return full;
}
