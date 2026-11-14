import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DirectoryFilters, type FilterSetup, type FilterText, type FilterValues } from "@/components/directory/DirectoryFilters";
import { ArrowLeftIcon, ArrowRightIcon, PlusIcon, UsersIcon } from "@/components/directory/icons";
import { PersonCard } from "@/components/directory/PersonCard";
import { PageHeader } from "@/components/PageHeader";
import { directory } from "@/content/ta-LK";
import { listFields } from "@/lib/directory/fields";
import { PUBLIC_PER_PAGE, listFilterOptions, listPublicCards, usableFilters } from "@/lib/directory/public";
import { directoryEnabled, directoryOpen, directoryTexts } from "@/lib/directory/text";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const text = directoryTexts(await getSettings());
  return { title: text.title, description: directory.lead };
}

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

const ctaClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-gold px-5 text-[0.95rem] font-bold text-ink shadow-sm transition-colors hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/40";

const pagerClass =
  "inline-flex h-10 items-center gap-2 rounded-full border-2 border-brand px-4 text-[0.95rem] font-semibold text-brand transition-colors hover:bg-brand hover:text-white";

export default async function DirectoryPage(props: PageProps<"/directory">) {
  const settings = await getSettings();
  if (!directoryEnabled(settings)) notFound();

  const text = directoryTexts(settings);
  const ui = directory.ui;
  const open = directoryOpen(settings);
  const sp = await props.searchParams;

  const q = first(sp.q).trim().slice(0, 80);
  const scopeParam = first(sp.scope);
  const scope = scopeParam === "lk" || scopeParam === "abroad" ? scopeParam : undefined;
  const country = first(sp.country).slice(0, 80);
  const district = first(sp.district).slice(0, 80);
  const ds = first(sp.ds).slice(0, 80);
  const gn = first(sp.gn).slice(0, 80);
  const postal = first(sp.postal).replace(/\D/g, "").slice(0, 5);
  const field = first(sp.field).slice(0, 80);
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const fields = await listFields();
  const usable = usableFilters(fields);
  const label = (key: string, fallback: string) => fields.find((f) => f.key === key)?.label ?? fallback;

  const [{ cards, total }, options] = await Promise.all([
    listPublicCards({ q, scope, country, district, ds, gn, postal, field, page }, fields),
    listFilterOptions(fields),
  ]);

  const pages = Math.max(1, Math.ceil(total / PUBLIC_PER_PAGE));
  const filtered = Boolean(q || scope || country || district || ds || gn || postal || field);

  // Links to the other pages of the list keep the search, and land on the list itself, not on the top of the page.
  const link = (next: number) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | number | undefined> = { q, scope, country, district, ds, gn, postal, field, page: next };
    for (const [key, value] of Object.entries(merged)) if (value !== undefined && value !== "" && !(key === "page" && value === 1)) params.set(key, String(value));
    const qs = params.toString();
    return `${qs ? `${directory.href}?${qs}` : directory.href}#results`;
  };

  const values: FilterValues = { q, scope: scope ?? "", field, country, district, ds, gn, postal };

  const setup: FilterSetup = {
    base: directory.href,
    showScope: usable.has("residence"),
    showField: usable.has("art_fields"),
    showCountry: usable.has("country"),
    showDistrict: usable.has("district"),
    showDs: usable.has("ds_division"),
    showGn: usable.has("gn_division"),
    showPostal: usable.has("postal_code"),
    fieldOptions: options.artFields,
    countryOptions: options.countries,
    districtOptions: options.districts,
    dsByDistrict: options.dsByDistrict,
    labels: {
      field: label("art_fields", ui.fieldsTitle),
      country: label("country", "நாடு"),
      district: label("district", "மாவட்டம்"),
      ds: label("ds_division", "பிரதேச செயலாளர் பிரிவு"),
      gn: label("gn_division", "கிராம அலுவலர் பிரிவு"),
      postal: label("postal_code", "தபால் குறியீடு"),
    },
  };

  const filterText: FilterText = {
    searchLabel: ui.searchLabel,
    searchPlaceholder: ui.searchPlaceholder,
    searchButton: ui.searchButton,
    scopeGroup: ui.scopeGroup,
    scopeAll: ui.scopeAll,
    scopeLk: ui.scopeLk,
    scopeAbroad: ui.scopeAbroad,
    anyOption: ui.anyOption,
    clearAll: ui.clearAll,
    filters: ui.filters,
    searching: ui.searching,
    nameLabel: ui.nameLabel,
    remove: ui.remove,
  };

  return (
    <main>
      {/* The register button is at the right edge of the heading (under the text on a phone), so it takes no row of its own. */}
      <PageHeader
        compact
        title={text.title}
        lead={<p>{text.lead}</p>}
        action={
          open ? (
            <Link href={directory.registerHref} className={ctaClass}>
              <PlusIcon className="h-5 w-5" />
              {directory.registerCta}
            </Link>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-5 sm:px-6 sm:py-6">
        <DirectoryFilters values={values} setup={setup} text={filterText} />

        <div id="results" className="scroll-mt-24 space-y-3 transition-opacity peer-data-[pending=true]:opacity-50">
          <h2 aria-live="polite" className="text-base font-bold text-ink sm:text-lg">
            {ui.results(total)}
          </h2>

          {cards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white/70 p-6 text-center sm:p-10">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sand text-brand">
                <UsersIcon className="h-6 w-6" />
              </span>
              <p className="mx-auto mt-3 max-w-xl text-base text-ink">{filtered ? ui.noResults : ui.empty}</p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {filtered && (
                  <Link href={directory.href} className="inline-flex h-10 items-center rounded-full border-2 border-brand px-5 text-[0.95rem] font-semibold text-brand transition-colors hover:bg-brand hover:text-white">
                    {ui.clearAll}
                  </Link>
                )}
                {!filtered && open && (
                  <Link href={directory.registerHref} className={ctaClass}>
                    <PlusIcon className="h-5 w-5" />
                    {directory.registerCta}
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map((card) => (
                <li key={card.code} className="min-w-0">
                  <PersonCard card={card} />
                </li>
              ))}
            </ul>
          )}

          {pages > 1 && (
            <nav aria-label={ui.pageOf(page, pages)} className="flex items-center justify-between gap-3 pt-1">
              {page > 1 ? (
                <Link href={link(page - 1)} rel="prev" className={pagerClass}>
                  <ArrowLeftIcon className="h-4 w-4" />
                  {ui.newer}
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-muted">{ui.pageOf(page, pages)}</span>
              {page < pages ? (
                <Link href={link(page + 1)} rel="next" className={pagerClass}>
                  {ui.older}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      </div>
    </main>
  );
}
