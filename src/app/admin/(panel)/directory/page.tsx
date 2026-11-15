import Link from "next/link";
import { Avatar } from "@/components/directory/PersonCard";
import { SendForReview, type SendReviewer } from "@/components/directory/SendForReview";
import { StatusBadge } from "@/components/directory/StatusBadge";
import { GridSelect } from "@/components/admin/GridSelect";
import { Icon } from "@/components/admin/Icon";
import { NoticeToast } from "@/components/admin/NoticeToast";
import { PageHeader } from "@/components/admin/PageHeader";
import { ScrollToActive } from "@/components/admin/ScrollToActive";
import { button, card } from "@/components/admin/ui";
import { directoryAdmin } from "@/content/admin-directory-en";
import { DIRECTORY_STATUSES, type DirectoryStatus } from "@/db/schema";
import { RESIDENCE_ABROAD } from "@/lib/directory/config";
import { ADMIN_PER_PAGE, listAdminEntries, statusCounts } from "@/lib/directory/entries";
import { listFields } from "@/lib/directory/fields";
import { listReviewerOptions, reviewersForEntries, type ReviewerChip } from "@/lib/directory/reviews";
import { directoryEnabled } from "@/lib/directory/text";
import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { publicUrl } from "@/lib/storage";

const text = directoryAdmin;

const dateFormat = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", day: "2-digit", month: "short", year: "numeric" });

// One small label per reviewer the person was sent to: what they said, or that they have not answered yet.
function chipLook(chip: ReviewerChip) {
  if (chip.verdict === "recommend_approve") return { label: text.list.reviewerGood(chip.reviewerName), className: "bg-green-50 text-green-800" };
  if (chip.verdict === "recommend_fix") return { label: text.list.reviewerFix(chip.reviewerName), className: "bg-sky-50 text-sky-800" };
  return { label: text.list.reviewerWaiting(chip.reviewerName), className: "bg-panel text-muted" };
}

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// One fixed height for the boxes and the Search button, so they line up even with Tamil text in them.
const boxClass = "mt-1 h-12 w-full rounded-xl border border-line bg-white px-3 py-2 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";
// The drop-down lists also get our own arrow (see globals.css), not the browser's.
const selectClass = `${boxClass} select-arrow`;

export default async function DirectoryAdminPage(props: PageProps<"/admin/directory">) {
  await requireAdmin();

  const sp = await props.searchParams;
  const statusParam = first(sp.status) || "pending";
  const status = (DIRECTORY_STATUSES as readonly string[]).includes(statusParam) ? (statusParam as DirectoryStatus) : undefined;
  const q = first(sp.q).trim().slice(0, 80);
  const scopeParam = first(sp.scope);
  const scope = scopeParam === "lk" || scopeParam === "abroad" ? scopeParam : undefined;
  const field = first(sp.field).slice(0, 80);
  const page = Math.max(1, Number(first(sp.page)) || 1);
  const notice = first(sp.notice) === "deleted" ? "Deleted successfully." : null;

  const [fields, settings] = await Promise.all([listFields(), getSettings()]);
  const [{ rows, total }, counts] = await Promise.all([listAdminEntries({ status, q, scope, field, page }), statusCounts()]);
  const [chips, reviewerOptions] = await Promise.all([reviewersForEntries(rows.map((r) => r.id)), listReviewerOptions()]);
  const sendReviewers: SendReviewer[] = reviewerOptions.map((r) => ({
    id: r.id,
    name: r.name,
    working: r.working,
    canSeePrivate: r.canSeePrivate,
    people: r.people,
    until: dateFormat.format(r.expiresAt),
  }));
  const artOptions = fields.find((f) => f.key === "art_fields")?.options ?? [];
  const pages = Math.max(1, Math.ceil(total / ADMIN_PER_PAGE));
  const filtered = Boolean(q || scope || field);

  const link = (next: { status?: string; page?: number }) => {
    const params = new URLSearchParams();
    const nextStatus = next.status ?? statusParam;
    if (nextStatus && nextStatus !== "pending") params.set("status", nextStatus);
    if (q) params.set("q", q);
    if (scope) params.set("scope", scope);
    if (field) params.set("field", field);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const qs = params.toString();
    return qs ? `/admin/directory?${qs}` : "/admin/directory";
  };

  const tabs: { key: string; label: string; count: number }[] = [
    { key: "pending", label: text.tabs.pending, count: counts.pending },
    { key: "approved", label: text.tabs.approved, count: counts.approved },
    { key: "update_needed", label: text.tabs.update_needed, count: counts.update_needed },
    { key: "rejected", label: text.tabs.rejected, count: counts.rejected },
    { key: "withdrawn", label: text.tabs.withdrawn, count: counts.withdrawn },
    { key: "all", label: text.tabs.all, count: counts.all },
  ];

  return (
    <>
      {/* The buttons are at the right edge of the heading, the gold one last. On a phone they take a full row each, "Add" first. */}
      <PageHeader
        title={text.nav.submissions}
        icon="users"
        stackActions
        actions={
          <>
            {/* On a phone "Add a person" takes the row and "Open the public page" is a square icon beside it. */}
            {directoryEnabled(settings) && (
              <Link
                href="/directory"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={text.openPublic}
                title={text.openPublic}
                className={`${button.secondary} max-sm:w-12 max-sm:shrink-0 max-sm:!px-0`}
              >
                <Icon name="externalLink" className="h-5 w-5" />
                <span className="max-sm:sr-only">{text.openPublic}</span>
              </Link>
            )}
            <Link href="/admin/directory/new" className={`${button.gold} border border-transparent max-sm:order-first max-sm:min-w-0 max-sm:flex-1`}>
              <Icon name="plus" className="h-5 w-5" />
              {text.add}
            </Link>
          </>
        }
      />

      {notice && <NoticeToast message={notice} />}

      {/* One row that swipes sideways on a phone (no scroll bar; the tab that is on is brought into view), wrapping on a wider screen. */}
      <nav
        aria-label="Status"
        className="mb-4 flex gap-2 overflow-x-auto max-sm:-mx-4 max-sm:px-4 max-sm:pb-0.5 sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ScrollToActive />
        {tabs.map((tab) => {
          const active = tab.key === statusParam || (tab.key === "pending" && !sp.status);
          return (
            <Link
              key={tab.key}
              href={link({ status: tab.key, page: 1 })}
              aria-current={active ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                active ? "border-brand bg-brand text-white" : "border-line bg-white text-brand hover:bg-sand/60"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-2 text-xs font-bold ${active ? "bg-white/20" : "bg-panel text-muted"}`}>{tab.count}</span>
            </Link>
          );
        })}
      </nav>

      {/* One row on a wide screen, with the Search button level with the boxes. Below that the name box has a row of its
          own and the two lists sit side by side, so the filter stays short on a phone. */}
      <form
        method="get"
        action="/admin/directory"
        className={`${card} mb-5 grid grid-cols-2 gap-3 p-3.5 sm:gap-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_11rem_13rem_auto] xl:items-end`}
      >
        {statusParam !== "pending" && <input type="hidden" name="status" value={statusParam} />}
        {/* Below the wide screen, the search button sits beside the name box (a round icon on a phone), so the filter stays short. */}
        <div className="col-span-2 flex items-end gap-2 xl:contents">
          <label className="block min-w-0 flex-1">
            <span className="text-sm font-semibold text-ink">{text.filters.search}</span>
            <input name="q" defaultValue={q} maxLength={80} className={boxClass} />
          </label>
          <div className="flex items-center gap-2 xl:order-last">
            <button type="submit" aria-label={text.filters.apply} className={`${button.primary} h-12 max-xl:w-12 max-xl:!px-0 xl:!px-6`}>
              <Icon name="search" className="h-5 w-5 xl:hidden" />
              <span className="max-xl:sr-only">{text.filters.apply}</span>
            </button>
            {filtered && (
              <Link href={link({ page: 1 }).split("?")[0] + (statusParam !== "pending" ? `?status=${statusParam}` : "")} className={button.ghost}>
                {text.filters.clear}
              </Link>
            )}
          </div>
        </div>
        <label className="block">
          <span className="text-sm font-semibold text-ink">{text.filters.scope}</span>
          <select name="scope" defaultValue={scope ?? ""} className={selectClass}>
            <option value="">{text.filters.scopeAll}</option>
            <option value="lk">{text.filters.scopeLk}</option>
            <option value="abroad">{text.filters.scopeAbroad}</option>
          </select>
        </label>
        <div className="block">
          <span id="filter-field-label" className="text-sm font-semibold text-ink">
            {text.filters.field}
          </span>
          {/* The list of fields is long, so it opens as a neat grid panel instead of one tall column. */}
          <GridSelect
            name="field"
            value={field}
            options={artOptions}
            labelId="filter-field-label"
            anyLabel={text.filters.anyField}
            allLabel={text.filters.allFields}
            searchLabel={text.filters.findField}
            noMatch={text.filters.noField}
            className={selectClass}
          />
        </div>
      </form>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-white/70 p-10 text-center text-muted">
          {filtered ? text.list.emptyFiltered : text.list.empty}
        </p>
      ) : (
        <>
          {/* The bar with "Select all" and "Send for review" is above the list; the window it opens lets the admin choose reviewers. */}
          <SendForReview reviewers={sendReviewers} total={total}>
          <ul className="space-y-3">
            {rows.map((row) => {
              const place =
                row.residence === RESIDENCE_ABROAD
                  ? [row.city, row.country]
                  : [row.city, row.dsDivision, row.district];
              const rowChips = chips.get(row.id) ?? [];
              return (
                <li
                  key={row.id}
                  className={`${card} grid grid-cols-[auto_auto_minmax(0,1fr)] items-start gap-x-3 gap-y-3 p-4 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto] sm:gap-x-4`}
                >
                  {/* The tick box is level with the middle of the photo. Its label is a bigger, invisible area around it, so a
                      finger can hit it (a 20px box alone is too small to tap). */}
                  <label className="-mx-3 -mb-3 mt-[0.35rem] flex cursor-pointer p-3">
                    <input type="checkbox" name="id" value={row.id} aria-label={row.name} className="h-5 w-5 shrink-0 accent-brand" />
                  </label>
                  <Avatar name={row.name} photoUrl={publicUrl(row.photoKey)} size="h-14 w-14" text="text-xl" border="border-2" />
                  {/* On a phone the part under the photo (date, reviewers) takes the whole width of the card, so it needs fewer lines. */}
                  <div className="min-w-0 flex-1 max-sm:contents">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <Link href={`/admin/directory/${row.id}`} lang="ta" className="text-lg font-semibold leading-snug text-ink [overflow-wrap:anywhere] hover:text-brand">
                          {row.name}
                        </Link>
                        <StatusBadge status={row.status} />
                        {row.code && <span className="text-xs font-semibold text-muted">{row.code}</span>}
                      </div>
                      <p lang="ta" className="text-sm text-muted [overflow-wrap:anywhere]">
                        {place.filter(Boolean).join(", ") || text.list.noPlace}
                      </p>
                      {row.artFields.length > 0 && (
                        <ul lang="ta" className="mt-2 flex flex-wrap gap-1.5">
                          {row.artFields.slice(0, 4).map((f) => (
                            <li key={f} className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-brand">
                              {f}
                            </li>
                          ))}
                          {row.artFields.length > 4 && <li className="text-xs font-semibold text-muted">+{row.artFields.length - 4}</li>}
                        </ul>
                      )}
                    </div>
                    <div className="min-w-0 max-sm:col-span-3 max-sm:-mt-1">
                      <p className="mt-2 text-xs text-muted">
                        {text.list.submitted} {dateFormat.format(row.submittedAt)} · {row.source === "admin" ? text.list.addedByAdmin : text.list.fromWebsite}
                      </p>
                      {rowChips.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5">
                          {rowChips.map((chip) => {
                            const look = chipLook(chip);
                            return (
                              <li key={chip.reviewId} className={`rounded-lg px-2.5 py-1 text-xs font-bold [overflow-wrap:anywhere] ${look.className}`}>
                                {look.label}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                  {/* Beside the name on a wide screen; on a phone a full-width button under everything (an easy thing to tap). */}
                  <Link
                    href={`/admin/directory/${row.id}`}
                    className={`${button.small} h-9 justify-self-start sm:justify-self-end max-sm:col-span-3 max-sm:h-10 max-sm:w-full max-sm:justify-self-stretch`}
                  >
                    {text.list.open}
                  </Link>
                </li>
              );
            })}
          </ul>
          </SendForReview>

          {pages > 1 && (
            <div className="mt-6 flex items-center justify-between gap-3">
              {page > 1 ? (
                <Link href={link({ page: page - 1 })} className={button.secondary}>
                  <Icon name="arrowLeft" className="h-4 w-4" />
                  Newer
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-muted">
                Page {page} of {pages}
              </span>
              {page < pages ? (
                <Link href={link({ page: page + 1 })} className={button.secondary}>
                  Older
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
