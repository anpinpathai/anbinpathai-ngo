import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, asc, desc, eq, inArray, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { directoryActivity, directoryEntries, directoryReviews, type DirectoryStatus } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import { siteUrl } from "@/lib/site-url";
import { seal, unseal } from "./review-secrets";

export type ReviewRow = typeof directoryReviews.$inferSelect;

export const MIN_REVIEW_PASSWORD = 8;
export const MAX_REVIEW_PASSWORD = 100;
export const REVIEW_DAY_CHOICES = [3, 7, 14, 30] as const;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function reviewLink(token: string) {
  return `${siteUrl()}/directory/review/${token}`;
}

// A short fingerprint of the password, kept in the reviewer's cookie, so a new password signs everybody out.
export function passwordMark(review: Pick<ReviewRow, "passwordHash">) {
  return createHash("sha256").update(review.passwordHash).digest("hex").slice(0, 16);
}

// The secret part of a reviewer link: 192 random bits, so it cannot be guessed.
export async function createReview(input: { reviewerName: string; password: string; days: number; canSeePrivate: boolean }) {
  const token = randomBytes(24).toString("base64url");
  const [row] = await db
    .insert(directoryReviews)
    .values({
      tokenHash: hashToken(token),
      tokenSealed: seal(token, "link"),
      passwordSealed: seal(input.password, "password"),
      reviewerName: input.reviewerName,
      passwordHash: await hashPassword(input.password),
      canSeePrivate: input.canSeePrivate,
      expiresAt: new Date(Date.now() + input.days * 24 * 3600 * 1000),
    })
    .returning({ id: directoryReviews.id });
  return { id: row.id, token, link: reviewLink(token) };
}

export async function findReviewByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const [row] = await db.select().from(directoryReviews).where(eq(directoryReviews.tokenHash, hashToken(token))).limit(1);
  return row ?? null;
}

export async function getReview(id: number) {
  const [row] = await db.select().from(directoryReviews).where(eq(directoryReviews.id, id)).limit(1);
  return row ?? null;
}

export type ReviewState = "ok" | "expired" | "revoked";

export function reviewState(review: Pick<ReviewRow, "revokedAt" | "expiresAt">, now = new Date()): ReviewState {
  if (review.revokedAt) return "revoked";
  if (review.expiresAt.getTime() <= now.getTime()) return "expired";
  return "ok";
}

export function checkReviewPassword(review: ReviewRow, password: string) {
  return verifyPassword(password, review.passwordHash);
}

// The link and the password of a reviewer, opened from their locked copies. Each is null when it cannot be shown
// (a reviewer made before the copies were kept, or the site's secret key was changed).
export async function revealReview(id: number) {
  const review = await getReview(id);
  if (!review) return null;
  const token = unseal(review.tokenSealed, "link");
  return { review, link: token ? reviewLink(token) : null, password: unseal(review.passwordSealed, "password") };
}

export type ReviewChanges = {
  reviewerName?: string;
  canSeePrivate?: boolean;
  // The link works this many days from today.
  days?: number;
  password?: string;
  // Make a new secret link. The old link stops working at once (and so does every open session of the reviewer).
  newLink?: boolean;
};

// A cancelled link cannot be changed any more. Returns false when nothing was changed.
export async function updateReview(id: number, changes: ReviewChanges) {
  const patch: Partial<typeof directoryReviews.$inferInsert> = {};
  if (changes.reviewerName !== undefined) patch.reviewerName = changes.reviewerName;
  if (changes.canSeePrivate !== undefined) patch.canSeePrivate = changes.canSeePrivate;
  if (changes.days !== undefined) patch.expiresAt = new Date(Date.now() + changes.days * 24 * 3600 * 1000);
  if (changes.password) {
    patch.passwordHash = await hashPassword(changes.password);
    patch.passwordSealed = seal(changes.password, "password");
  }
  if (changes.newLink) {
    const token = randomBytes(24).toString("base64url");
    patch.tokenHash = hashToken(token);
    patch.tokenSealed = seal(token, "link");
  }
  if (Object.keys(patch).length === 0) return false;
  const rows = await db
    .update(directoryReviews)
    .set(patch)
    .where(and(eq(directoryReviews.id, id), isNull(directoryReviews.revokedAt)))
    .returning({ id: directoryReviews.id });
  return rows.length > 0;
}

export async function revokeReview(id: number) {
  await db.update(directoryReviews).set({ revokedAt: new Date() }).where(eq(directoryReviews.id, id));
}

// Removes a reviewer that has stopped working (cancelled or expired). What the reviewer said stays in each person's history.
export async function deleteReview(id: number) {
  await db.delete(directoryReviews).where(eq(directoryReviews.id, id));
}

export async function markOpened(id: number) {
  await db.update(directoryReviews).set({ lastOpenedAt: new Date() }).where(eq(directoryReviews.id, id));
}

// ---------------------------------------------------------------------------------------------------------------
// Who is on a reviewer's list
// ---------------------------------------------------------------------------------------------------------------

export type SentResult = { reviewId: number; reviewerName: string; added: number[]; already: number; total: number };

// Adds people to the lists of the chosen reviewers. Nobody is added twice, and a cancelled or expired reviewer gets
// nobody (it is left out of the answer). The link and the password of a reviewer never change when people are added.
export async function addPeopleToReviews(reviewIds: number[], entryIds: number[]): Promise<SentResult[]> {
  if (reviewIds.length === 0 || entryIds.length === 0) return [];
  const reviews = await db.select().from(directoryReviews).where(inArray(directoryReviews.id, reviewIds));
  const results: SentResult[] = [];

  for (const review of reviews) {
    if (reviewState(review) !== "ok") continue;
    const have = new Set(review.entryIds);
    const added = entryIds.filter((id) => !have.has(id));
    if (added.length > 0) {
      // One statement does the union, so two admins sending at the same moment cannot lose each other's people.
      const list = sql.join(
        added.map((id) => sql`${id}`),
        sql`, `,
      );
      await db
        .update(directoryReviews)
        .set({
          entryIds: sql`(select coalesce(array_agg(distinct x order by x), '{}'::int[]) from unnest(${directoryReviews.entryIds} || array[${list}]::int[]) as x)`,
        })
        .where(eq(directoryReviews.id, review.id));
    }
    results.push({
      reviewId: review.id,
      reviewerName: review.reviewerName,
      added,
      already: entryIds.length - added.length,
      total: have.size + added.length,
    });
  }
  return results;
}

export async function removePersonFromReview(reviewId: number, entryId: number) {
  await db
    .update(directoryReviews)
    .set({ entryIds: sql`array_remove(${directoryReviews.entryIds}, ${entryId})` })
    .where(eq(directoryReviews.id, reviewId));
}

// ---------------------------------------------------------------------------------------------------------------
// What the reviewers have said
// ---------------------------------------------------------------------------------------------------------------

export type ReviewVerdict = "recommend_approve" | "recommend_fix";
const VERDICTS: ReviewVerdict[] = ["recommend_approve", "recommend_fix"];

// The reviewers the admin can still send people to (a cancelled one is left out), for the "Send for review" window.
export async function listReviewerOptions() {
  const rows = await db
    .select()
    .from(directoryReviews)
    .where(isNull(directoryReviews.revokedAt))
    .orderBy(desc(directoryReviews.createdAt), desc(directoryReviews.id));
  return rows.map((row) => ({
    id: row.id,
    name: row.reviewerName,
    working: reviewState(row) === "ok",
    canSeePrivate: row.canSeePrivate,
    people: row.entryIds.length,
    expiresAt: row.expiresAt,
  }));
}

export type Verdict = { action: ReviewVerdict; detail: string; at: Date };

// The last "looks good" / "needs a fix" this reviewer gave for each person.
export async function verdictsForReview(reviewId: number) {
  const rows = await db
    .select()
    .from(directoryActivity)
    .where(and(eq(directoryActivity.reviewId, reviewId), inArray(directoryActivity.action, VERDICTS)))
    .orderBy(asc(directoryActivity.createdAt), asc(directoryActivity.id));

  const map = new Map<number, Verdict>();
  for (const row of rows) map.set(row.entryId, { action: row.action as ReviewVerdict, detail: row.detail, at: row.createdAt });
  return map;
}

export type ReviewerPerson = { id: number; name: string; status: DirectoryStatus; verdict: ReviewVerdict | null };
export type ReviewerSummary = { review: ReviewRow; state: ReviewState; people: ReviewerPerson[] };

// Every reviewer, newest first, with the people on their list and what each reviewer said about them.
export async function listReviewersWithPeople(): Promise<ReviewerSummary[]> {
  const reviews = await db.select().from(directoryReviews).orderBy(desc(directoryReviews.createdAt), desc(directoryReviews.id));
  const ids = [...new Set(reviews.flatMap((r) => r.entryIds))];

  const [entries, verdicts] = await Promise.all([
    ids.length === 0
      ? []
      : db
          .select({ id: directoryEntries.id, name: directoryEntries.name, status: directoryEntries.status })
          .from(directoryEntries)
          .where(inArray(directoryEntries.id, ids)),
    ids.length === 0
      ? []
      : db
          .select({ reviewId: directoryActivity.reviewId, entryId: directoryActivity.entryId, action: directoryActivity.action })
          .from(directoryActivity)
          .where(and(inArray(directoryActivity.entryId, ids), inArray(directoryActivity.action, VERDICTS), isNotNull(directoryActivity.reviewId)))
          .orderBy(asc(directoryActivity.createdAt), asc(directoryActivity.id)),
  ]);

  const byId = new Map(entries.map((e) => [e.id, e]));
  const said = new Map<string, ReviewVerdict>();
  for (const row of verdicts) said.set(`${row.reviewId}:${row.entryId}`, row.action as ReviewVerdict);

  return reviews.map((review) => ({
    review,
    state: reviewState(review),
    people: review.entryIds
      .map((id) => byId.get(id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
      .map((e) => ({ id: e.id, name: e.name, status: e.status, verdict: said.get(`${review.id}:${e.id}`) ?? null })),
  }));
}

export type ReviewerChip = { reviewId: number; reviewerName: string; state: ReviewState; verdict: ReviewVerdict | null };

// For the Submissions list: which reviewers each person was sent to, and what they said. A cancelled reviewer is shown
// only when they had already given an answer.
export async function reviewersForEntries(entryIds: number[]) {
  const map = new Map<number, ReviewerChip[]>();
  if (entryIds.length === 0) return map;

  const wanted = new Set(entryIds);
  const reviews = (await db.select().from(directoryReviews).orderBy(asc(directoryReviews.createdAt), asc(directoryReviews.id))).filter((r) =>
    r.entryIds.some((id) => wanted.has(id)),
  );
  if (reviews.length === 0) return map;

  const verdicts = await db
    .select({ reviewId: directoryActivity.reviewId, entryId: directoryActivity.entryId, action: directoryActivity.action })
    .from(directoryActivity)
    .where(
      and(
        inArray(directoryActivity.entryId, entryIds),
        inArray(directoryActivity.action, VERDICTS),
        inArray(
          directoryActivity.reviewId,
          reviews.map((r) => r.id),
        ),
      ),
    )
    .orderBy(asc(directoryActivity.createdAt), asc(directoryActivity.id));
  const said = new Map<string, ReviewVerdict>();
  for (const row of verdicts) said.set(`${row.reviewId}:${row.entryId}`, row.action as ReviewVerdict);

  for (const review of reviews) {
    const state = reviewState(review);
    for (const id of review.entryIds) {
      if (!wanted.has(id)) continue;
      const verdict = said.get(`${review.id}:${id}`) ?? null;
      if (state === "revoked" && !verdict) continue;
      const list = map.get(id) ?? [];
      list.push({ reviewId: review.id, reviewerName: review.reviewerName, state, verdict });
      map.set(id, list);
    }
  }
  return map;
}
