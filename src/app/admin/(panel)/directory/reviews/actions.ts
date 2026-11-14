"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { directoryAdmin } from "@/content/admin-directory-en";
import { getEntries, logActivityMany } from "@/lib/directory/entries";
import {
  MAX_REVIEW_PASSWORD,
  MIN_REVIEW_PASSWORD,
  REVIEW_DAY_CHOICES,
  addPeopleToReviews,
  createReview,
  deleteReview,
  getReview,
  removePersonFromReview,
  revealReview,
  revokeReview,
  reviewState,
  updateReview,
} from "@/lib/directory/reviews";
import { oneLine } from "@/lib/directory/validate";
import { requireAdmin } from "@/lib/session";

const text = directoryAdmin.reviews;

type Failure = { ok: false; error: string };

function refresh() {
  revalidatePath("/admin/directory/reviews");
  revalidatePath("/admin/directory");
}

function cleanIds(values: readonly number[], max: number) {
  return [...new Set(values.map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, max);
}

// Makes the reviewer with a secret link and a password. Both can be looked at again later on the Reviewers page.
export async function createReviewAction(input: {
  reviewerName: string;
  password: string;
  days: number;
  canSeePrivate: boolean;
}): Promise<{ ok: true; link: string; password: string } | Failure> {
  await requireAdmin();

  const reviewerName = oneLine(String(input.reviewerName ?? "")).slice(0, 80);
  const password = String(input.password ?? "");
  if (!reviewerName) return { ok: false, error: text.nameRequired };
  if (password.length < MIN_REVIEW_PASSWORD || password.length > MAX_REVIEW_PASSWORD) return { ok: false, error: text.passwordShort };
  if (!(REVIEW_DAY_CHOICES as readonly number[]).includes(input.days)) return { ok: false, error: text.failed };

  try {
    const { link } = await createReview({ reviewerName, password, days: input.days, canSeePrivate: input.canSeePrivate === true });
    refresh();
    return { ok: true, link, password };
  } catch (err) {
    console.error("Adding a reviewer failed:", err);
    return { ok: false, error: text.failed };
  }
}

// The link and the password of one reviewer, opened from their locked copies. Only when the admin asks.
export async function revealReviewAction(id: number): Promise<{ ok: true; link: string | null; password: string | null } | Failure> {
  await requireAdmin();
  if (!Number.isInteger(id)) return { ok: false, error: text.notFound };
  try {
    const found = await revealReview(id);
    if (!found) return { ok: false, error: text.notFound };
    return { ok: true, link: found.link, password: found.password };
  } catch (err) {
    console.error("Opening a reviewer's link failed:", err);
    return { ok: false, error: text.failed };
  }
}

export async function updateReviewAction(input: {
  id: number;
  reviewerName: string;
  canSeePrivate: boolean;
  // Days from today, or null to keep the date as it is.
  days: number | null;
  // Empty keeps the password.
  password: string;
  // Make a new link; the old one stops working.
  newLink: boolean;
}): Promise<{ ok: true } | Failure> {
  await requireAdmin();

  const reviewerName = oneLine(String(input.reviewerName ?? "")).slice(0, 80);
  const password = String(input.password ?? "");
  if (!Number.isInteger(input.id)) return { ok: false, error: text.notFound };
  if (!reviewerName) return { ok: false, error: text.nameRequired };
  if (password && (password.length < MIN_REVIEW_PASSWORD || password.length > MAX_REVIEW_PASSWORD)) return { ok: false, error: text.passwordShort };
  if (input.days !== null && !(REVIEW_DAY_CHOICES as readonly number[]).includes(input.days)) return { ok: false, error: text.failed };

  try {
    const changed = await updateReview(input.id, {
      reviewerName,
      canSeePrivate: input.canSeePrivate === true,
      days: input.days ?? undefined,
      password: password || undefined,
      newLink: input.newLink === true,
    });
    if (!changed) return { ok: false, error: text.stopped };
    refresh();
    return { ok: true };
  } catch (err) {
    console.error("Changing a reviewer failed:", err);
    return { ok: false, error: text.failed };
  }
}

export async function revokeReviewAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await revokeReview(id);
  refresh();
  redirect("/admin/directory/reviews?notice=cancelled");
}

// Takes a reviewer that has already stopped off the page. A working link must be cancelled first.
export async function deleteReviewAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    const review = await getReview(id);
    if (review && reviewState(review) !== "ok") await deleteReview(id);
  }
  refresh();
  redirect("/admin/directory/reviews?notice=removed");
}

export async function removeReviewPersonAction(input: { reviewId: number; entryId: number }): Promise<{ ok: true } | Failure> {
  await requireAdmin();
  if (!Number.isInteger(input.reviewId) || !Number.isInteger(input.entryId)) return { ok: false, error: text.failed };
  try {
    await removePersonFromReview(input.reviewId, input.entryId);
    refresh();
    return { ok: true };
  } catch (err) {
    console.error("Taking a person off a reviewer's list failed:", err);
    return { ok: false, error: text.failed };
  }
}

export type SentToReviewer = {
  reviewId: number;
  reviewerName: string;
  added: number;
  already: number;
  link: string | null;
  password: string | null;
};

// The "Send for review" window on the Submissions page: puts the ticked people on the lists of the chosen reviewers
// and hands back each reviewer's link and password, so the admin can copy them straight away.
export async function sendToReviewersAction(input: { entryIds: number[]; reviewIds: number[] }): Promise<{ ok: true; sent: SentToReviewer[] } | Failure> {
  await requireAdmin();

  const entryIds = cleanIds(input.entryIds ?? [], 200);
  const reviewIds = cleanIds(input.reviewIds ?? [], 50);
  if (entryIds.length === 0 || reviewIds.length === 0) return { ok: false, error: directoryAdmin.reviews.send.pickOne };

  try {
    const entries = await getEntries(entryIds);
    if (entries.length === 0) return { ok: false, error: text.failed };

    const results = await addPeopleToReviews(
      reviewIds,
      entries.map((e) => e.id),
    );
    if (results.length === 0) return { ok: false, error: text.send.expiredHint };

    await logActivityMany(
      results.flatMap((r) =>
        r.added.map((entryId) => ({ entryId, actor: "admin", action: "sent_review", detail: r.reviewerName, reviewId: r.reviewId })),
      ),
    );

    const sent: SentToReviewer[] = [];
    for (const r of results) {
      const found = await revealReview(r.reviewId);
      sent.push({
        reviewId: r.reviewId,
        reviewerName: r.reviewerName,
        added: r.added.length,
        already: r.already,
        link: found?.link ?? null,
        password: found?.password ?? null,
      });
    }
    refresh();
    return { ok: true, sent };
  } catch (err) {
    console.error("Sending people to reviewers failed:", err);
    return { ok: false, error: text.send.failed };
  }
}
