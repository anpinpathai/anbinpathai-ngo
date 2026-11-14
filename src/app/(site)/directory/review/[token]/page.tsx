import type { Metadata } from "next";
import { ReviewPasswordForm } from "@/components/directory/ReviewerForms";
import { ReviewerList, type ReviewRowView } from "@/components/directory/ReviewerList";
import { ReviewNotice } from "@/components/directory/ReviewNotice";
import { PageHeader } from "@/components/PageHeader";
import { directory } from "@/content/ta-LK";
import { getEntries } from "@/lib/directory/entries";
import { listFields } from "@/lib/directory/fields";
import { reviewAccess } from "@/lib/directory/review-session";
import { artFor, photoShownFor, placeFor, rowState } from "@/lib/directory/review-view";
import { verdictsForReview } from "@/lib/directory/reviews";
import { publicUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

// A private page: never listed by search engines.
export const metadata: Metadata = { title: directory.review.title, robots: { index: false, follow: false } };

const ui = directory.review;

const when = new Intl.DateTimeFormat("ta-LK", { timeZone: "Asia/Colombo", dateStyle: "medium", timeStyle: "short" });

// The page of a reviewer's link: the password first, then the people the admin sent, as a list to work through.
export default async function ReviewPage(props: PageProps<"/directory/review/[token]">) {
  const { token } = await props.params;
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
          <ReviewPasswordForm token={token} />
        </div>
      </main>
    );
  }

  const { review } = access;
  const [entries, allFields, verdicts] = await Promise.all([getEntries(review.entryIds), listFields(), verdictsForReview(review.id)]);

  // Only what this reviewer may see goes to the page (see review-view.ts).
  const rows: ReviewRowView[] = entries.map((entry) => ({
    id: entry.id,
    name: entry.name,
    place: placeFor(review, allFields, entry),
    art: artFor(review, allFields, entry),
    photoUrl: photoShownFor(review, allFields, entry) ? publicUrl(entry.photoKey) : null,
    state: rowState(entry, verdicts.get(entry.id)),
  }));

  return (
    <main>
      <PageHeader compact title={ui.title} crumb={ui.title} lead={<p>{ui.intro}</p>} />

      <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-12">
        <p className="text-muted">
          <span className="font-semibold text-ink">{ui.hello(review.reviewerName)}.</span> {ui.validUntil(when.format(review.expiresAt))}
        </p>

        {rows.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line bg-white/70 p-8 text-center text-muted">{ui.none}</p>
        ) : (
          <ReviewerList token={token} rows={rows} />
        )}
      </div>
    </main>
  );
}
