"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { directory } from "@/content/ta-LK";
import { getEntry, logActivity, updateEntryValues } from "@/lib/directory/entries";
import { listFields } from "@/lib/directory/fields";
import type { EntryFormState } from "@/lib/directory/form-state";
import { reviewAccess, startReviewSession } from "@/lib/directory/review-session";
import { fieldsFor, isOpen } from "@/lib/directory/review-view";
import { checkReviewPassword, findReviewByToken, markOpened, reviewState } from "@/lib/directory/reviews";
import { REVIEW_PASSWORD_LIMIT } from "@/lib/directory/spam";
import { MESSAGES_TA, oneLine, readEntryForm, validateEntry } from "@/lib/directory/validate";
import { clearFailures, getClientIp, isBlocked, recordFailure } from "@/lib/login-throttle";

const ui = directory.review;

export type UnlockState = { error?: string };

// The reviewer types the password the admin gave them. Wrong tries are counted and limited.
export async function unlockReviewAction(_prev: UnlockState, formData: FormData): Promise<UnlockState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  const review = await findReviewByToken(token);
  if (!review || reviewState(review) !== "ok") return { error: ui.unavailableInvalid };

  const ipKey = `dir-review-ip:${await getClientIp()}`;
  const reviewKey = `dir-review:${review.id}`;
  if ((await isBlocked(ipKey, REVIEW_PASSWORD_LIMIT)) || (await isBlocked(reviewKey, REVIEW_PASSWORD_LIMIT))) {
    return { error: ui.blocked };
  }

  if (!password || password.length > 200 || !(await checkReviewPassword(review, password))) {
    await recordFailure(ipKey);
    await recordFailure(reviewKey);
    return { error: ui.wrongPassword };
  }

  await clearFailures(reviewKey);
  await startReviewSession(review);
  await markOpened(review.id);

  // Someone who came to one person's page (and had to type the password first) goes back to that page.
  const entryId = Number(formData.get("entry"));
  redirect(Number.isInteger(entryId) && review.entryIds.includes(entryId) ? `/directory/review/${token}/${entryId}` : `/directory/review/${token}`);
}

// A person the reviewer may still change or give an opinion on: only on their list, and only while the admin has not decided.
async function reviewerContext(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const entryId = Number(formData.get("entryId"));
  const access = await reviewAccess(token);
  if (access.status !== "open") return null;
  if (!Number.isInteger(entryId) || !access.review.entryIds.includes(entryId)) return null;

  const entry = await getEntry(entryId);
  if (!entry || !isOpen(entry)) return null;
  return { token, entry, review: access.review };
}

// The reviewer corrects an answer. Private answers and the photo can never be changed from here.
export async function reviewerSaveAction(_prev: EntryFormState, formData: FormData): Promise<EntryFormState> {
  const context = await reviewerContext(formData);
  const keep = (message: string, values = {}, shares = {}, errors = {}): EntryFormState => ({ status: "error", message, values, shares, errors });
  if (!context) return keep(ui.notAllowed);

  const { review, entry, token } = context;
  const all = await listFields();
  // The same rule as the page: without the admin's permission a reviewer works only with what the public would see.
  const editable = fieldsFor(review, all, entry).filter((f) => f.type !== "photo");
  const raw = readEntryForm(formData, editable);
  const clean = validateEntry(raw, editable, "reviewer", MESSAGES_TA);
  if (Object.keys(clean.errors).length > 0) return keep(ui.failed, clean.values, {}, clean.errors);

  try {
    // What the person agreed to show publicly is their own choice: a reviewer corrects answers but never changes it.
    await updateEntryValues(entry.id, clean.values, {}, editable, `reviewer: ${review.reviewerName}`, review.id);
  } catch (err) {
    console.error("A reviewer's edit failed:", err);
    return keep(ui.failed, clean.values);
  }

  revalidatePath(`/directory/review/${token}/${entry.id}`);
  return { status: "saved", message: ui.saved, values: clean.values, shares: {}, errors: {} };
}

export type RecommendState = { status: "idle" | "saved" | "error"; message?: string };

// "Looks good" or "needs a fix", with a note. It only helps the admin; it changes nothing on the website.
export async function recommendAction(_prev: RecommendState, formData: FormData): Promise<RecommendState> {
  const context = await reviewerContext(formData);
  if (!context) return { status: "error", message: ui.notAllowed };

  const choice = formData.get("choice") === "approve" ? "recommend_approve" : "recommend_fix";
  const note = oneLine(String(formData.get("note") ?? "")).slice(0, 1000);

  try {
    await logActivity(context.entry.id, `reviewer: ${context.review.reviewerName}`, choice, note, context.review.id);
  } catch (err) {
    console.error("A reviewer's recommendation failed:", err);
    return { status: "error", message: ui.failed };
  }

  revalidatePath(`/directory/review/${context.token}/${context.entry.id}`);
  revalidatePath(`/directory/review/${context.token}`);
  return { status: "saved", message: ui.sent };
}
