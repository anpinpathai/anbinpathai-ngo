"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition, type FormEvent } from "react";
import { CloseIcon, SearchIcon, SlidersIcon } from "./icons";

export type Scope = "" | "lk" | "abroad";

// Everything the visitor has chosen. It always matches the address of the page (?q=...&field=...), so a search
// can be shared, bookmarked, and the Back button works.
export type FilterValues = {
  q: string;
  scope: Scope;
  field: string;
  country: string;
  district: string;
  ds: string;
  gn: string;
  postal: string;
};

export type FilterSetup = {
  base: string;
  showScope: boolean;
  showField: boolean;
  showCountry: boolean;
  showDistrict: boolean;
  showDs: boolean;
  showGn: boolean;
  showPostal: boolean;
  fieldOptions: string[];
  countryOptions: string[];
  districtOptions: string[];
  dsByDistrict: Record<string, string[]>;
  labels: { field: string; country: string; district: string; ds: string; gn: string; postal: string };
};

export type FilterText = {
  searchLabel: string;
  searchPlaceholder: string;
  searchButton: string;
  scopeGroup: string;
  scopeAll: string;
  scopeLk: string;
  scopeAbroad: string;
  anyOption: string;
  clearAll: string;
  filters: string;
  searching: string;
  nameLabel: string;
  remove: string;
};

const EMPTY: FilterValues = { q: "", scope: "", field: "", country: "", district: "", ds: "", gn: "", postal: "" };

function toUrl(base: string, v: FilterValues) {
  const params = new URLSearchParams();
  for (const key of ["q", "scope", "field", "country", "district", "ds", "gn", "postal"] as const) {
    if (v[key]) params.set(key, v[key]);
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

// One height (about 47px) for every box and button of the toolbar, so they line up and nothing feels oversized.
const boxClass =
  "h-10 w-full rounded-xl border border-line bg-white px-3 text-[0.95rem] text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";
// The drop-down lists get the site's own arrow (see globals.css), not the browser's.
const selectClass = `${boxClass} select-arrow`;
const labelClass = "mb-1 block text-[0.8rem] font-semibold text-muted";

function Select({
  label,
  name,
  value,
  options,
  any,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  any: string;
  onChange: (value: string) => void;
}) {
  // A value from the address that is not in the list is still shown, so the box never tells a different story.
  const list = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <label className="block min-w-0 sm:w-48 lg:w-52">
      <span className={labelClass}>{label}</span>
      <select name={name} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        <option value="">{any}</option>
        {list.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

type Chip = { id: string; text: string; clear: Partial<FilterValues> };

// The search box, the "everyone / Sri Lanka / abroad" switch and the choices above the list. A choice from a list
// is applied at once; words are applied with the Search button or the Enter key. The list below updates without
// the page jumping or reloading.
export function DirectoryFilters({ values, setup, text }: { values: FilterValues; setup: FilterSetup; text: FilterText }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // What is shown right now. It changes the moment a choice is made, before the new list has arrived.
  const [shown, setShown] = useOptimistic(values);
  const [open, setOpen] = useState(false);

  // The words being typed. They follow the address when it changes by itself (Back button, "clear"), never while typing.
  const [synced, setSynced] = useState({ q: shown.q, gn: shown.gn, postal: shown.postal });
  const [draft, setDraft] = useState({ q: shown.q, gn: shown.gn, postal: shown.postal });
  if (shown.q !== synced.q || shown.gn !== synced.gn || shown.postal !== synced.postal) {
    const next = { q: shown.q, gn: shown.gn, postal: shown.postal };
    setSynced(next);
    setDraft(next);
  }

  function apply(next: FilterValues) {
    startTransition(() => {
      setShown(next);
      router.replace(toUrl(setup.base, next), { scroll: false });
    });
  }

  // A change always carries the words typed so far, so nothing the person wrote is lost.
  function go(change: Partial<FilterValues>) {
    apply({
      ...shown,
      q: draft.q.trim(),
      gn: draft.gn.trim(),
      postal: draft.postal.replace(/\D/g, "").slice(0, 5),
      ...change,
    });
  }

  function chooseScope(scope: Scope) {
    // The places of the other side are dropped, so the list never keeps a choice the person can no longer see.
    if (scope === "lk") go({ scope, country: "" });
    else if (scope === "abroad") go({ scope, district: "", ds: "", gn: "", postal: "" });
    else go({ scope, country: "", district: "", ds: "", gn: "", postal: "" });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    go({});
  }

  const sriLanka = setup.showScope ? shown.scope === "lk" : true;
  const abroad = setup.showScope ? shown.scope === "abroad" : true;
  const dsOptions = shown.district ? (setup.dsByDistrict[shown.district] ?? []) : [];

  const showField = setup.showField && setup.fieldOptions.length > 0;
  const showCountry = setup.showCountry && abroad && setup.countryOptions.length > 0;
  const showDistrict = setup.showDistrict && sriLanka && setup.districtOptions.length > 0;
  const showDs = setup.showDs && sriLanka && dsOptions.length > 0;
  const showGn = setup.showGn && sriLanka;
  const showPostal = setup.showPostal && sriLanka;
  const hasPanel = showField || showCountry || showDistrict || showDs || showGn || showPostal;

  const chips: Chip[] = [];
  if (shown.q) chips.push({ id: "q", text: `${text.nameLabel}: ${shown.q}`, clear: { q: "" } });
  if (shown.field) chips.push({ id: "field", text: shown.field, clear: { field: "" } });
  if (shown.country) chips.push({ id: "country", text: shown.country, clear: { country: "" } });
  if (shown.district) chips.push({ id: "district", text: shown.district, clear: { district: "", ds: "" } });
  if (shown.ds) chips.push({ id: "ds", text: shown.ds, clear: { ds: "" } });
  if (shown.gn) chips.push({ id: "gn", text: shown.gn, clear: { gn: "" } });
  if (shown.postal) chips.push({ id: "postal", text: shown.postal, clear: { postal: "" } });
  const activeInPanel = chips.filter((c) => c.id !== "q").length;

  const scopes: { value: Scope; label: string }[] = [
    { value: "", label: text.scopeAll },
    { value: "lk", label: text.scopeLk },
    { value: "abroad", label: text.scopeAbroad },
  ];

  return (
    <div className="peer relative rounded-2xl border border-line bg-white p-3 shadow-sm sm:p-4" data-pending={pending}>
      {/* A thin gold bar slides along the top while the list is being updated. */}
      <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-2xl transition-opacity ${pending ? "opacity-100" : "opacity-0"}`}>
        <div className="dir-bar h-full w-1/4 bg-gold" />
      </div>
      <p role="status" className="sr-only">
        {pending ? text.searching : ""}
      </p>

      <form method="get" action={setup.base} role="search" aria-label={text.searchLabel} onSubmit={onSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-muted sm:left-3.5" />
            <input
              type="search"
              name="q"
              value={draft.q}
              onChange={(e) => setDraft({ ...draft, q: e.target.value })}
              maxLength={80}
              placeholder={text.searchPlaceholder}
              aria-label={text.searchLabel}
              enterKeyHint="search"
              autoComplete="off"
              className={`h-10 w-full rounded-full border border-line bg-white pl-9 text-[0.9rem] text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 sm:pl-10 sm:text-[0.95rem] [&::-webkit-search-cancel-button]:hidden ${draft.q ? "pr-9 sm:pr-10" : "pr-2 sm:pr-4"}`}
            />
            {draft.q && (
              <button
                type="button"
                aria-label={`${text.nameLabel} - ${text.remove}`}
                onClick={() => {
                  setDraft({ ...draft, q: "" });
                  if (shown.q) go({ q: "" });
                }}
                className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-sand hover:text-brand"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* On a phone the "Filters" button is a round button beside the search box, with the number of choices on it. */}
          {hasPanel && (
            <button
              type="button"
              aria-expanded={open}
              aria-controls="dir-filter-panel"
              aria-label={text.filters}
              title={text.filters}
              onClick={() => setOpen(!open)}
              className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-full border text-brand transition-colors sm:hidden ${
                open ? "border-brand bg-brand/10" : "border-line bg-white hover:bg-sand/60"
              }`}
            >
              <SlidersIcon className="h-[1.1rem] w-[1.1rem]" />
              {activeInPanel > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-xs font-bold text-white">{activeInPanel}</span>
              )}
            </button>
          )}
          <button
            type="submit"
            aria-label={text.searchButton}
            className="inline-flex h-10 w-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand text-[0.95rem] font-semibold text-white transition-colors hover:bg-brand-dark sm:w-auto sm:px-6"
          >
            <SearchIcon className="h-[1.1rem] w-[1.1rem] sm:hidden" />
            <span className="hidden sm:inline">{text.searchButton}</span>
          </button>
        </div>

        {(setup.showScope || hasPanel) && (
          <div className="flex flex-wrap items-end gap-x-3 gap-y-2.5">
            {setup.showScope && (
              <div className="w-full sm:w-auto">
                {/* On a phone the switch speaks for itself ("Everyone / Sri Lanka / Abroad"), so its title is only for screen readers. */}
                <span id="dir-scope-label" className={`${labelClass} sr-only sm:not-sr-only`}>
                  {text.scopeGroup}
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="dir-scope-label"
                  className="flex w-full overflow-x-auto rounded-full bg-sand p-0.5 [scrollbar-width:none] sm:inline-flex sm:w-auto [&::-webkit-scrollbar]:hidden"
                >
                  {scopes.map((s) => {
                    const on = shown.scope === s.value;
                    return (
                      <button
                        key={s.value || "all"}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => chooseScope(s.value)}
                        className={`h-9 flex-auto whitespace-nowrap rounded-full px-2 text-center text-[0.85rem] font-semibold transition-colors sm:flex-none sm:px-4 sm:text-[0.9rem] ${
                          on ? "bg-brand text-white shadow-sm" : "text-brand hover:bg-white/70"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* On a phone the choices open under the switch, when the "Filters" button is pressed. On a bigger screen they sit on the same line. */}
            {hasPanel && (
              <div id="dir-filter-panel" className={`${open ? "grid" : "hidden"} w-full gap-2.5 sm:contents`}>
                {showField && (
                  <Select label={setup.labels.field} name="field" value={shown.field} options={setup.fieldOptions} any={text.anyOption} onChange={(v) => go({ field: v })} />
                )}
                {showCountry && (
                  <Select label={setup.labels.country} name="country" value={shown.country} options={setup.countryOptions} any={text.anyOption} onChange={(v) => go({ country: v })} />
                )}
                {showDistrict && (
                  <Select label={setup.labels.district} name="district" value={shown.district} options={setup.districtOptions} any={text.anyOption} onChange={(v) => go({ district: v, ds: "" })} />
                )}
                {showDs && (
                  <Select label={setup.labels.ds} name="ds" value={shown.ds} options={dsOptions} any={text.anyOption} onChange={(v) => go({ ds: v })} />
                )}
                {showGn && (
                  <label className="block min-w-0 sm:w-48">
                    <span className={labelClass}>{setup.labels.gn}</span>
                    <input name="gn" value={draft.gn} onChange={(e) => setDraft({ ...draft, gn: e.target.value })} maxLength={80} className={boxClass} />
                  </label>
                )}
                {showPostal && (
                  <label className="block min-w-0 sm:w-36">
                    <span className={labelClass}>{setup.labels.postal}</span>
                    <input
                      name="postal"
                      value={draft.postal}
                      onChange={(e) => setDraft({ ...draft, postal: e.target.value })}
                      inputMode="numeric"
                      maxLength={5}
                      className={boxClass}
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        )}
      </form>

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line/70 pt-3">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => go(chip.clear)}
              aria-label={`${chip.text} - ${text.remove}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-brand/10 py-0.5 pl-3 pr-1.5 text-[0.85rem] font-semibold text-brand transition-colors hover:bg-brand/20"
            >
              <span className="min-w-0 truncate">{chip.text}</span>
              <CloseIcon className="h-3.5 w-3.5 shrink-0" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => apply(EMPTY)}
            className="rounded-full px-2 py-1 text-[0.85rem] font-semibold text-brand underline underline-offset-4 hover:text-brand-dark"
          >
            {text.clearAll}
          </button>
        </div>
      )}
    </div>
  );
}
