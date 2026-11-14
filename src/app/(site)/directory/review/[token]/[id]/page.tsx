import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/directory/PersonCard";
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon, PencilIcon, PinIcon } from "@/components/directory/icons";
import { RecommendForm, ReviewerEditForm, ReviewPasswordForm } from "@/components/directory/ReviewerForms";
import { StateBadge } from "@/components/directory/ReviewerList";
import { ReviewNotice } from "@/components/directory/ReviewNotice";
import { PageHeader } from "@/components/PageHeader";
import { directory } from "@/content/ta-LK";
import { entryToValues, getEntries, type EntryRow } from "@/lib/directory/entries";
import { listFields } from "@/lib/directory/fields";
import type { EntryFormState } from "@/lib/directory/form-state";
import { reviewAccess } from "@/lib/directory/review-session";
import { answerList, fieldsFor, isOpen, photoShownFor, placeFor, rowState } from "@/lib/directory/review-view";
import { verdictsForReview } from "@/lib/directory/reviews";
import { publicUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

// A private page: never listed by search engines.
export const metadata: Metadata = { title: directory.review.title, robots: { index: false, follow: false } };

const ui = directory.review;

const linkClass =
  "inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-base font-semibold text-brand transition-colors hover:bg-sand/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold";

// Back to the list, and to the person before and after this one.
function PersonNav({ token, index, total, previous, next }: { token: string; index: number; total: number; previous?: EntryRow; next?: EntryRow }) {
  return (
    <nav aria-label={ui.title} className="flex flex-wrap items-center justify-between gap-3">
      <Link href={`/directory/review/${token}`} className="-my-1.5 inline-flex items-center gap-1.5 py-2.5 font-semibold text-brand underline-offset-4 hover:underline">
        <ArrowLeftIcon className="h-4 w-4" />
        {ui.back}
      </Link>
      <div className="flex items-center gap-2">
        {previous && (
          <Link href={`/directory/review/${token}/${previous.id}`} className={linkClass}>
            <ArrowLeftIcon className="h-4 w-4" />
            {ui.previousPerson}
          </Link>
        )}
        <span className="px-1 text-sm font-semibold text-muted">
          {index + 1} / {total}
        </span>
        {next && (
          <Link href={`/directory/review/${token}/${next.id}`} className={linkClass}>
            {ui.nextPerson}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
      </div>
    </nav>
  );
}

// The page of one person on a reviewer's list: the answers, a way to correct them, and the "looks good" / "needs a fix" answer.
export default async function ReviewPersonPage(props: PageProps<"/directory/review/[token]/[id]">) {
  const { token, id } = await props.params;
  const entryId = Number(id);
  const access = await reviewAccess(token);

  if (access.status === "invalid") return <ReviewNotice title={ui.unavailableTitle} message={ui.unavailableInvalid} />;
  if (access.status === "closed") {
    return <ReviewNotice title={ui.unavailableTitle} message={access.why === "expired" ? ui.unavailableExpired : ui.unavailableRevoked} />;
  }

  if (access.status === "locked") {
    return (
      <main>
        <PageHeader compact title={ui.title} crumb={ui.title} />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <ReviewPasswordForm token={token} entryId={Number.isInteger(entryId) ? entryId : undefined} />
        </div>
      </main>
    );
  }

  const { review } = access;
  if (!Number.isInteger(entryId) || !review.entryIds.includes(entryId)) notFound();

  const [entries, allFields, verdicts] = await Promise.all([getEntries(review.entryIds), listFields(), verdictsForReview(review.id)]);
  const index = entries.findIndex((e) => e.id === entryId);
  if (index < 0) notFound();
  const entry = entries[index];
  const open = isOpen(entry);
  const verdict = verdicts.get(entry.id);

  // Unless the admin allowed more, a reviewer sees only what the public would see (see review-view.ts). The edit form is
  // given only those answers too: whatever is handed to it is sent to the browser, so hiding it on the screen is not enough.
  const visible = fieldsFor(review, allFields, entry);
  const editable = visible.filter((f) => f.type !== "photo");
  const everything = entryToValues(entry);
  const values: typeof everything = {};
  for (const field of editable) if (everything[field.key] !== undefined) values[field.key] = everything[field.key];
  const initial: EntryFormState = { status: "idle", values, shares: {}, errors: {} };

  const answers = answerList(entry, visible);
  const place = placeFor(review, allFields, entry);
  const nav = { token, index, total: entries.length, previous: entries[index - 1], next: entries[index + 1] };

  return (
    <main>
      <PageHeader
        compact
        title={entry.name}
        crumb={entry.name}
        icon={
          <Avatar
            name={entry.name}
            photoUrl={photoShownFor(review, allFields, entry) ? publicUrl(entry.photoKey) : null}
            size="h-12 w-12 sm:h-20 sm:w-20"
            text="text-xl sm:text-2xl"
            border="border-2"
          />
        }
        lead={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <StateBadge state={rowState(entry, verdict)} />
            {place && (
              <span className="inline-flex items-start gap-1 text-[0.9rem] text-muted [overflow-wrap:anywhere] sm:text-base">
                <PinIcon className="mt-[0.2rem] h-3.5 w-3.5 shrink-0 text-brand/60 sm:mt-1 sm:h-4 sm:w-4" />
                {place}
              </span>
            )}
          </div>
        }
      />

      <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-12">
        <PersonNav {...nav} />

        <section aria-labelledby="answers-title" className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:rounded-3xl sm:p-8">
          <h2 id="answers-title" className="text-xl text-brand sm:text-2xl">
            {ui.answersTitle}
          </h2>
          <dl className="mt-4">
            {answers.length === 0 && <p className="text-muted">{ui.empty}</p>}
            {answers.map((row) => (
              <div key={row.key} className="grid gap-0.5 border-t border-line/70 py-2.5 first:border-t-0 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-6 sm:py-3">
                <dt className="text-[0.9rem] font-semibold text-muted sm:text-base">{row.label}</dt>
                <dd className="whitespace-pre-line text-ink [overflow-wrap:anywhere]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {!open ? (
          <p className="rounded-3xl bg-panel p-5 text-center text-lg text-muted">{ui.decided}</p>
        ) : (
          <>
            {editable.length > 0 && (
              <details className="group rounded-3xl border border-line bg-white shadow-sm">
                <summary className="flex cursor-pointer list-none items-center gap-3 rounded-3xl px-5 py-4 transition-colors hover:bg-sand/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold sm:px-8 sm:py-5 [&::-webkit-details-marker]:hidden">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                    <PencilIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xl font-bold text-brand">{ui.editTitle}</span>
                    <span className="block text-sm text-muted">{ui.editHelp}</span>
                  </span>
                  <ChevronDownIcon className="h-6 w-6 shrink-0 text-brand transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <div className="border-t border-line p-2 min-[400px]:p-3 sm:p-5">
                  <ReviewerEditForm token={token} entryId={entry.id} fields={editable} initial={initial} />
                </div>
              </details>
            )}

            <section aria-labelledby="recommend-title" className="rounded-2xl border border-line bg-sand/50 p-4 sm:rounded-3xl sm:p-8">
              <h2 id="recommend-title" className="text-xl text-brand sm:text-2xl">
                {ui.recommendTitle}
              </h2>
              <p className="mb-5 mt-1 text-muted">{ui.recommendHelp}</p>
              <RecommendForm token={token} entryId={entry.id} lastChoice={verdict?.action ?? null} />
            </section>
          </>
        )}

        <PersonNav {...nav} />
      </div>
    </main>
  );
}
