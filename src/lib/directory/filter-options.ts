// The choices in the filter boxes of the public list. This file does no database work, so it can be tested on its own.
// A choice is built ONLY for a question that is public and switched on as a "Search filter" (the `usable` set).
// Any other question gets an empty list, so a private answer is never sent to a visitor's browser, not even
// as a list of choices.

export type OptionRow = {
  country: string;
  district: string;
  ds: string;
  native: string;
  fields: string[];
};

export type FilterOptions = {
  countries: string[];
  districts: string[];
  dsDivisions: string[];
  // The divisions that people of each district have, so choosing a district offers only its own divisions.
  dsByDistrict: Record<string, string[]>;
  nativeDistricts: string[];
  artFields: string[];
};

const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "ta"));

export function buildFilterOptions(rows: readonly OptionRow[], usable: ReadonlySet<string>): FilterOptions {
  const only = (key: string, values: string[]) => (usable.has(key) ? unique(values) : []);

  // A division is tied to its district, so this needs both questions to be public filters.
  const dsByDistrict: Record<string, string[]> = {};
  if (usable.has("district") && usable.has("ds_division")) {
    for (const r of rows) {
      if (r.district && r.ds) (dsByDistrict[r.district] ??= []).push(r.ds);
    }
    for (const district of Object.keys(dsByDistrict)) dsByDistrict[district] = unique(dsByDistrict[district]);
  }

  return {
    countries: only("country", rows.map((r) => r.country)),
    districts: only("district", rows.map((r) => r.district)),
    dsDivisions: only("ds_division", rows.map((r) => r.ds)),
    dsByDistrict,
    nativeDistricts: only("native_district", rows.map((r) => r.native)),
    artFields: only("art_fields", rows.flatMap((r) => r.fields)),
  };
}
