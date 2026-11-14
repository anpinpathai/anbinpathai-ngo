"use client";

import { useActionState, useEffect, useState } from "react";
import { ActionBar } from "@/components/admin/ActionBar";
import { useToast } from "@/components/toast/ToastProvider";
import { directory } from "@/content/ta-LK";
import type { DirectoryFieldRow } from "@/lib/directory/config";
import type { EntryFormState } from "@/lib/directory/form-state";
import { FORM_UI_TA } from "@/lib/directory/ui-text";
import { recommendAction, reviewerSaveAction, unlockReviewAction, type RecommendState, type UnlockState } from "@/app/(site)/directory/review/[token]/actions";
import { EntryStepsForm } from "./EntryStepsForm";
import { inputClass } from "./FieldShell";
import { CheckIcon, EyeIcon, EyeOffIcon, LockIcon, PencilIcon } from "./icons";

const ui = directory.review;

// The password page of a reviewer's link. `entryId` is set when the reviewer came to the page of one person, so after the
// password they land on that same page.
export function ReviewPasswordForm({ token, entryId }: { token: string; entryId?: number }) {
  const [state, action, pending] = useActionState<UnlockState, FormData>(unlockReviewAction, {});
  const [shown, setShown] = useState(false);

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-8">
      {/* On a phone the lock sits above the words (beside them there is no room for the long Tamil words); from "sm" it is beside them. */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand sm:h-14 sm:w-14">
          <LockIcon className="h-6 w-6 sm:h-7 sm:w-7" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl leading-snug text-brand [overflow-wrap:anywhere]">{ui.passwordTitle}</h2>
          <p className="mt-1 text-muted [overflow-wrap:anywhere]">{ui.passwordHelp}</p>
        </div>
      </div>

      <form action={action} className="mt-5 space-y-5 sm:mt-6">
        <input type="hidden" name="token" value={token} />
        {entryId !== undefined && <input type="hidden" name="entry" value={entryId} />}
        <div>
          <label htmlFor="review-password" className="font-semibold text-ink">
            {ui.passwordLabel}
          </label>
          <div className="relative mt-1.5">
            <input
              id="review-password"
              type={shown ? "text" : "password"}
              name="password"
              required
              maxLength={200}
              autoComplete="off"
              aria-invalid={Boolean(state.error)}
              className={`${inputClass(state.error)} !mt-0 pr-14`}
            />
            <button
              type="button"
              onClick={() => setShown((v) => !v)}
              aria-label={shown ? ui.hidePassword : ui.showPassword}
              title={shown ? ui.hidePassword : ui.showPassword}
              className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:bg-sand/60 hover:text-brand focus-visible:ring-4 focus-visible:ring-gold"
            >
              {shown ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          {state.error && (
            <p role="alert" className="mt-2 text-sm font-semibold text-red-700">
              {state.error}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex w-full items-center justify-center rounded-full bg-brand px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold disabled:opacity-60"
        >
          {ui.open}
        </button>
      </form>
    </div>
  );
}

// The reviewer corrects answers. The same steps as the admin's page of one person, in Tamil, without the photo and without
// the private answers unless the admin allowed them.
export function ReviewerEditForm({
  token,
  entryId,
  fields,
  initial,
}: {
  token: string;
  entryId: number;
  fields: readonly DirectoryFieldRow[];
  initial: EntryFormState;
}) {
  return (
    <EntryStepsForm
      fields={fields}
      initial={initial}
      action={reviewerSaveAction}
      mode="reviewer"
      ui={FORM_UI_TA}
      uploadUrl={null}
      photoUrl={null}
      hidden={{ token, entryId: String(entryId) }}
      labels={{ steps: ui.stepsLabel, step: ui.step, previous: ui.previous, next: ui.next, problem: ui.stepProblem }}
      actions={({ pending, dirty }) => (
        <ActionBar
          status={
            dirty ? (
              <span className="inline-flex items-center gap-2 text-muted">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold" />
                {ui.unsaved}
              </span>
            ) : null
          }
        >
          <button
            type="submit"
            disabled={pending}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-brand px-6 py-3 font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold disabled:opacity-60 sm:flex-none"
          >
            {pending ? ui.saving : ui.saveEdits}
          </button>
        </ActionBar>
      )}
    />
  );
}

export function RecommendForm({ token, entryId, lastChoice }: { token: string; entryId: number; lastChoice: string | null }) {
  const [state, action, pending] = useActionState<RecommendState, FormData>(recommendAction, { status: "idle" });
  const toast = useToast();

  useEffect(() => {
    if (state.status === "saved") toast.success(state.message ?? "");
    else if (state.status === "error") toast.error(state.message ?? ui.failed);
  }, [state, toast]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="entryId" value={entryId} />

      {lastChoice && (
        <p
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-bold ${
            lastChoice === "recommend_approve" ? "bg-green-100 text-green-800" : "bg-sky-100 text-sky-800"
          }`}
        >
          {lastChoice === "recommend_approve" ? <CheckIcon className="h-4 w-4" /> : <PencilIcon className="h-4 w-4" />}
          {ui.yourLast}: {lastChoice === "recommend_approve" ? ui.looksGood : ui.needsFix}
        </p>
      )}

      <label className="block">
        <span className="font-semibold text-ink">{ui.noteLabel}</span>
        <textarea name="note" rows={3} maxLength={1000} placeholder={ui.notePlaceholder} className={inputClass()} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="submit"
          name="choice"
          value="approve"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-green-700 px-6 py-3 font-bold text-white transition-colors hover:bg-green-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold disabled:opacity-60"
        >
          <CheckIcon className="h-5 w-5" />
          {ui.looksGood}
        </button>
        <button
          type="submit"
          name="choice"
          value="fix"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-sky-700 px-6 py-3 font-bold text-sky-800 transition-colors hover:bg-sky-700 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold disabled:opacity-60"
        >
          <PencilIcon className="h-5 w-5" />
          {ui.needsFix}
        </button>
      </div>
    </form>
  );
}
