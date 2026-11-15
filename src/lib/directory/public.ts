import "server-only";
import { and, arrayContains, asc, count, eq, ilike, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { directoryEntries } from "@/db/schema";
import { publicUrl } from "@/lib/storage";
import { isHttpsUrl } from "@/lib/urls";
import { ALWAYS_PUBLIC_KEYS, RESIDENCE_ABROAD, RESIDENCE_LK, type DirectoryFieldRow } from "./config";
import { formatDate } from "./dates";
import type { EntryRow } from "./entries";
import { buildFilterOptions, type FilterOptions } from "./filter-options";

export type { FilterOptions } from "./filter-options";

// This is the ONLY place the public pages read entries from. It returns only what may be shown:
// a question is shown when it is switched to "public", or when it is "the person chooses" and the person ticked it.
// Private answers (email, phone, ...) never leave this file.

export const PUBLIC_PER_PAGE = 24;

export function isPublicField(field: DirectoryFieldRow | undefined, entry: EntryRow) {
  if (!field) return false;
  if ((ALWAYS_PUBLIC_KEYS as readonly string[]).includes(field.key)) return true;
  if (field.visibility === "public") return true;
  if (field.visibility === "applicant") return entry.shareChoices[field.key] === true;
  return false;
}

export type PublicCard = {
  code: string;
  name: string;
  photoUrl: string | null;
  artFields: string[];
  place: string;
};

export type PublicItem =
  | { key: string; label: string; kind: "text"; value: string }
  | { key: string; label: string; kind: "list"; value: string[] }
  | { key: string; label: string; kind: "links"; value: string[] }
  | { key: string; label: string; kind: "link"; value: string };

export type PublicProfile = PublicCard & { items: PublicItem[] };

// Fields that are shown in the heading of the profile, not in the list of details.
const HEADING_KEYS = new Set([
  "name",
  "photo",
  "art_fields",
  "residence",
  "country",
  "district",
  "ds_division",
  "gn_division",
  "postal_code",
  "city",
]);

function byKey(fields: readonly DirectoryFieldRow[]) {
  return new Map(fields.map((f) => [f.key, f]));
}

function toCard(entry: EntryRow, fields: Map<string, DirectoryFieldRow>): PublicCard {
  const shown = (key: string) => isPublicField(fields.get(key), entry);
  const part = (key: string, value: string) => (shown(key) && value ? [value] : []);

  const place =
    entry.residence === RESIDENCE_ABROAD
      ? [...part("city", entry.city), ...part("country", entry.country)]
      : [...part("city", entry.city), ...part("ds_division", entry.dsDivision), ...part("district", entry.district), ...part("country", entry.country)];

  return {
    code: entry.code as string,
    name: entry.name,
    photoUrl: shown("photo") ? publicUrl(entry.photoKey) : null,
    artFields: shown("art_fields") ? entry.artFields : [],
    place: place.join(", "),
  };
}

export type PublicFilters = {
  q?: string;
  scope?: typeof RESIDENCE_LK | typeof RESIDENCE_ABROAD;
  country?: string;
  district?: string;
  ds?: string;
  gn?: string;
  postal?: string;
  field?: string;
  native?: string;
  page: number;
};

function escapeLike(text: string) {
  return text.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// A filter works only when its question is public AND switched on as a filter. Otherwise it is ignored, so a
// hidden answer can never be discovered by filtering.
export function usableFilters(fields: readonly DirectoryFieldRow[]) {
  const usable = new Set<string>();
  for (const f of fields) if (f.visibility === "public" && f.filterable) usable.add(f.key);
  return usable;
}

export async function listPublicCards(filters: PublicFilters, fields: readonly DirectoryFieldRow[]) {
  const usable = usableFilters(fields);
  const map = byKey(fields);

  const conditions: (SQL | undefined)[] = [
    eq(directoryEntries.status, "approved"),
    filters.q ? ilike(directoryEntries.name, `%${escapeLike(filters.q)}%`) : undefined,
    filters.scope && usable.has("residence") ? eq(directoryEntries.residence, filters.scope) : undefined,
    filters.country && usable.has("country") ? eq(directoryEntries.country, filters.country) : undefined,
    filters.district && usable.has("district") ? eq(directoryEntries.district, filters.district) : undefined,
    filters.ds && usable.has("ds_division") ? eq(directoryEntries.dsDivision, filters.ds) : undefined,
    filters.gn && usable.has("gn_division") ? ilike(directoryEntries.gnDivision, `%${escapeLike(filters.gn)}%`) : undefined,
    filters.postal && usable.has("postal_code") ? eq(directoryEntries.postalCode, filters.postal) : undefined,
    filters.native && usable.has("native_district") ? eq(directoryEntries.nativeDistrict, filters.native) : undefined,
    filters.field && usable.has("art_fields") ? arrayContains(directoryEntries.artFields, [filters.field]) : undefined,
  ];
  const where = and(...conditions);

  const [rows, [total]] = await Promise.all([
    db
      .select()
      .from(directoryEntries)
      .where(where)
      .orderBy(asc(directoryEntries.name), asc(directoryEntries.id))
      .limit(PUBLIC_PER_PAGE)
      .offset((filters.page - 1) * PUBLIC_PER_PAGE),
    db.select({ n: count() }).from(directoryEntries).where(where),
  ]);

  return { cards: rows.filter((r) => r.code).map((r) => toCard(r, map)), total: total?.n ?? 0 };
}

export async function getPublicProfile(code: string, fields: readonly DirectoryFieldRow[]): Promise<PublicProfile | null> {
  const [entry] = await db
    .select()
    .from(directoryEntries)
    .where(and(eq(directoryEntries.code, code), eq(directoryEntries.status, "approved")))
    .limit(1);
  if (!entry || !entry.code) return null;

  const map = byKey(fields);
  const card = toCard(entry, map);
  const items: PublicItem[] = [];

  for (const field of fields) {
    if (HEADING_KEYS.has(field.key) || !isPublicField(field, entry)) continue;

    const raw = field.key === "native_district" ? entry.nativeDistrict : entry.answers[field.key];
    if (raw === undefined || raw === "" || (Array.isArray(raw) && raw.length === 0)) continue;

    if (Array.isArray(raw)) {
      items.push({ key: field.key, label: field.label, kind: "list", value: raw });
    } else if (field.type === "links") {
      const links = raw.split("\n").filter((l) => isHttpsUrl(l));
      if (links.length > 0) items.push({ key: field.key, label: field.label, kind: "links", value: links });
    } else if (field.type === "url") {
      if (isHttpsUrl(raw)) items.push({ key: field.key, label: field.label, kind: "link", value: raw });
    } else {
      // A date is saved as 1985-03-21 and shown as 21 மார்ச் 1985.
      items.push({ key: field.key, label: field.label, kind: "text", value: field.type === "date" ? formatDate(raw) : raw });
    }
  }

  return { ...card, items };
}

export async function listPublicCodes() {
  const rows = await db
    .select({ code: directoryEntries.code, updatedAt: directoryEntries.updatedAt })
    .from(directoryEntries)
    .where(eq(directoryEntries.status, "approved"));
  return rows.filter((r): r is { code: string; updatedAt: Date } => Boolean(r.code));
}

// The choices in the filter boxes: only places and fields that real, approved people have, so no filter is empty,
// and only for questions that are public AND switched on as a filter (see filter-options.ts).
export async function listFilterOptions(fields: readonly DirectoryFieldRow[]): Promise<FilterOptions> {
  const rows = await db
    .select({
      country: directoryEntries.country,
      district: directoryEntries.district,
      ds: directoryEntries.dsDivision,
      native: directoryEntries.nativeDistrict,
      fields: directoryEntries.artFields,
    })
    .from(directoryEntries)
    .where(eq(directoryEntries.status, "approved"));

  return buildFilterOptions(rows, usableFilters(fields));
}
