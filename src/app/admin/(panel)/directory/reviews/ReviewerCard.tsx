"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { CopyField } from "@/components/admin/CopyField";
import { Icon } from "@/components/admin/Icon";
import { button, card } from "@/components/admin/ui";
import { StatusBadge } from "@/components/directory/StatusBadge";
import { useToast } from "@/components/toast/ToastProvider";
import { directoryAdmin } from "@/content/admin-directory-en";
import type { DirectoryStatus } from "@/db/schema";
import type { ReviewVerdict } from "@/lib/directory/reviews";
import { deleteReviewAction, removeReviewPersonAction, revealReviewAction, revokeReviewAction } from "./actions";
import { EditReviewerDialog } from "./EditReviewerDialog";
import type { ReviewerView } from "./types";

const text = directoryAdmin.reviews;

const stateLook = {
  ok: "bg-green-100 text-green-800",
  expired: "bg-panel text-muted",
  revoked: "bg-red-100 text-red-800",
} as const;

const OPEN: DirectoryStatus[] = ["pending", "update_needed"];

function VerdictChip({ verdict, status }: { verdict: ReviewVerdict | null; status: DirectoryStatus }) {
  if (verdict === "recommend_approve") {
    return <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">{text.verdicts.recommend_approve}</span>;
  }
  if (verdict === "recommend_fix") {
    return <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800">{text.verdicts.recommend_fix}</span>;
  }
  // The admin has already decided, so nothing is waited for any more.
  if (!OPEN.includes(status)) return null;
  return <span className="rounded-full bg-panel px-2.5 py-0.5 text-xs font-bold text-muted">{text.verdicts.waiting}</span>;
}

type Access = { link: string | null; password: string | null } | "error";

// One reviewer: who they are, whether the link still works, the link and password on request, and the people they have.
export function ReviewerCard({ reviewer }: { reviewer: ReviewerView }) {
  const router = useRouter();
  const toast = useToast();
  const [access, setAccess] = useState<Access | null>(null);
  const [accessOpen, setAccessOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<number | null>(null);

  const stopped = reviewer.state === "revoked";
  const working = reviewer.state === "ok";

  // The link and the password are asked for only when the admin presses the button, and are not kept on the page otherwise.
  function toggleAccess() {
    if (accessOpen) {
      setAccessOpen(false);
      return;
    }
    setAccessOpen(true);
    if (access) return;
    startTransition(async () => {
      const result = await revealReviewAction(reviewer.id);
      setAccess(result.ok ? { link: result.link, password: result.password } : "error");
    });
  }

  function takeOff(entryId: number) {
    setBusyId(entryId);
    startTransition(async () => {
      const result = await removeReviewPersonAction({ reviewId: reviewer.id, entryId });
      setBusyId(null);
      if (result.ok) {
        toast.success(text.takenOff);
        router.refresh();
      } else toast.error(result.error);
    });
  }

  const actionClass = `${button.small} h-10 sm:h-9`;
  // "Cancel the link" is short enough to share a row with "Edit" on a phone; "Remove this reviewer" is not, so it takes its own row.
  const dangerClass = `${actionClass} !text-red-700 hover:!border-red-200 hover:!bg-red-50 ${working ? "" : "max-sm:col-span-2"}`;

  return (
    <li className={`${card} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h2 className="text-lg font-semibold leading-snug text-ink [overflow-wrap:anywhere]">{reviewer.name}</h2>
            <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-bold ${stateLook[reviewer.state]}`}>{text.states[reviewer.state]}</span>
          </div>
          <p className="mt-0.5 text-sm text-muted">
            {text.people(reviewer.people.length)}
            {reviewer.waiting > 0 && ` · ${text.waitingCount(reviewer.waiting)}`} · {text.privateShort}: {reviewer.canSeePrivate ? text.yes : text.no}
          </p>
        </div>

        {/* On a phone: "Link and password" has the first row, "Edit" and "Cancel the link" share the next one. */}
        <div className="flex flex-wrap items-center gap-2 max-sm:grid max-sm:w-full max-sm:grid-cols-2">
          {!stopped && (
            <button type="button" onClick={toggleAccess} aria-expanded={accessOpen} className={`${actionClass} max-sm:col-span-2`}>
              <Icon name="key" className="h-4 w-4" />
              {text.linkAndPassword}
            </button>
          )}
          {!stopped && (
            <button type="button" onClick={() => setEditing(true)} className={`${actionClass} ${working ? "" : "max-sm:col-span-2"}`}>
              <Icon name="edit" className="h-4 w-4" />
              {text.edit}
            </button>
          )}
          {working ? (
            <ConfirmButton
              action={revokeReviewAction}
              hidden={{ id: reviewer.id }}
              label={text.cancelLink}
              title={text.cancelTitle}
              message={text.cancelConfirm}
              confirmLabel={text.cancelYes}
              pendingLabel={text.cancelling}
              keepLabel={text.cancelKeep}
              className={dangerClass}
            />
          ) : (
            <ConfirmButton
              action={deleteReviewAction}
              hidden={{ id: reviewer.id }}
              label={text.removeLabel}
              icon="trash"
              title={text.removeTitle}
              message={text.removeConfirm}
              confirmLabel={text.removeLabel}
              pendingLabel="Removing…"
              className={dangerClass}
            />
          )}
        </div>
      </div>

      {accessOpen && (
        <div className="mt-4 space-y-3 rounded-xl border border-line bg-panel/60 p-4">
          {access === null ? (
            <p className="text-sm text-muted">{text.opening}</p>
          ) : access === "error" ? (
            <p role="alert" className="text-sm font-semibold text-red-700">
              {text.failed}
            </p>
          ) : (
            <>
              {access.link && <CopyField label={text.linkLabel} value={access.link} copyLabel={text.copy} copiedLabel={text.copied} />}
              {access.password && (
                <CopyField
                  label={text.passwordLabel}
                  value={access.password}
                  secret
                  copyLabel={text.copy}
                  copiedLabel={text.copied}
                  showLabel={text.show}
                  hideLabel={text.hide}
                />
              )}
              {(!access.link || !access.password) && <p className="text-sm font-semibold text-amber-800">{text.notShown}</p>}
            </>
          )}
        </div>
      )}

      {/* On a phone each date is one line (name on the left, date on the right); from "sm" they are three columns. */}
      <dl className="mt-4 grid gap-x-6 gap-y-1.5 border-t border-line/70 pt-4 text-sm sm:grid-cols-3">
        <div className="flex items-baseline justify-between gap-3 sm:block">
          <dt className="text-muted">{text.columns.expires}</dt>
          <dd className="text-right font-semibold text-ink sm:text-left">{reviewer.expiresText}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 sm:block">
          <dt className="text-muted">{text.columns.opened}</dt>
          <dd className="text-right font-semibold text-ink sm:text-left">{reviewer.openedText ?? text.never}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 sm:block">
          <dt className="text-muted">{text.columns.created}</dt>
          <dd className="text-right font-semibold text-ink sm:text-left">{reviewer.createdText}</dd>
        </div>
      </dl>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setPeopleOpen((v) => !v)}
          aria-expanded={peopleOpen}
          className="-my-2 inline-flex items-center gap-1.5 py-2 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          <Icon name={peopleOpen ? "chevronUp" : "chevronDown"} className="h-4 w-4" />
          {peopleOpen ? text.hidePeople : text.showPeople} ({reviewer.people.length})
        </button>

        {peopleOpen &&
          (reviewer.people.length === 0 ? (
            <p className="mt-3 rounded-xl bg-panel p-3 text-sm text-muted">{text.noPeople}</p>
          ) : (
            <ul className="mt-3 divide-y divide-line/70 rounded-xl border border-line/80 bg-white">
              {reviewer.people.map((person) => (
                <li key={person.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2.5">
                  <Link href={`/admin/directory/${person.id}`} lang="ta" className="min-w-0 flex-1 basis-40 font-semibold text-ink [overflow-wrap:anywhere] hover:text-brand">
                    {person.name}
                  </Link>
                  <StatusBadge status={person.status} />
                  <VerdictChip verdict={person.verdict} status={person.status} />
                  {working && (
                    <button
                      type="button"
                      onClick={() => takeOff(person.id)}
                      disabled={busyId === person.id}
                      aria-label={`${text.takeOff}: ${person.name}`}
                      title={text.takeOff}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-white text-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                    >
                      <Icon name="x" className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ))}
      </div>

      {editing && (
        <EditReviewerDialog
          reviewer={reviewer}
          onClose={() => setEditing(false)}
          onSaved={() => {
            // The password may have changed, so the old one is forgotten and asked for again when the admin looks.
            setAccess(null);
            setAccessOpen(false);
          }}
        />
      )}
    </li>
  );
}
