import { NoticeToast } from "@/components/admin/NoticeToast";
import { PageHeader } from "@/components/admin/PageHeader";
import { directoryAdmin } from "@/content/admin-directory-en";
import { listReviewersWithPeople } from "@/lib/directory/reviews";
import { requireAdmin } from "@/lib/session";
import { AddReviewerButton } from "./AddReviewerButton";
import { ReviewerCard } from "./ReviewerCard";
import type { ReviewerView } from "./types";

const text = directoryAdmin.reviews;

const stamp = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const dateOnly = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", day: "2-digit", month: "short", year: "numeric" });

const notices: Record<string, string> = {
  cancelled: "The link is cancelled.",
  removed: "Reviewer removed.",
};

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// The reviewers. A reviewer is made here; the people they look at are sent from the Submissions page.
export default async function ReviewersPage(props: PageProps<"/admin/directory/reviews">) {
  await requireAdmin();

  const sp = await props.searchParams;
  const notice = notices[first(sp.notice)];
  const summaries = await listReviewersWithPeople();

  // Only what the page needs: never the link, the password or their fingerprints.
  const reviewers: ReviewerView[] = summaries.map(({ review, state, people }) => ({
    id: review.id,
    name: review.reviewerName,
    state,
    canSeePrivate: review.canSeePrivate,
    createdText: stamp.format(review.createdAt),
    expiresText: stamp.format(review.expiresAt),
    expiresDate: dateOnly.format(review.expiresAt),
    openedText: review.lastOpenedAt ? stamp.format(review.lastOpenedAt) : null,
    linkKept: Boolean(review.tokenSealed && review.passwordSealed),
    waiting: people.filter((p) => !p.verdict && (p.status === "pending" || p.status === "update_needed")).length,
    people,
  }));

  return (
    <>
      {/* The button is at the right edge of the heading (on a phone it takes the whole row). */}
      <PageHeader title={text.title} icon="lock" stackActions actions={<AddReviewerButton />} />

      {notice && <NoticeToast message={notice} />}

      {reviewers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white/70 p-10 text-center">
          <p className="text-lg font-semibold text-ink">{text.empty}</p>
          <p className="mx-auto mt-1 max-w-md text-muted">{text.emptyHelp}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reviewers.map((reviewer) => (
            <ReviewerCard key={reviewer.id} reviewer={reviewer} />
          ))}
        </ul>
      )}
    </>
  );
}
