import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/admin/Icon";
import { NoticeToast } from "@/components/admin/NoticeToast";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { button, card, inputClass } from "@/components/admin/ui";
import { AdminEntryForm } from "@/components/directory/AdminEntryForm";
import { Avatar } from "@/components/directory/PersonCard";
import { StatusBadge } from "@/components/directory/StatusBadge";
import { directoryAdmin } from "@/content/admin-directory-en";
import { entryToValues, getEntry, listActivity } from "@/lib/directory/entries";
import { listFields } from "@/lib/directory/fields";
import type { EntryFormState } from "@/lib/directory/form-state";
import { directoryEnabled } from "@/lib/directory/text";
import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { publicUrl } from "@/lib/storage";
import { approveEntryAction, deleteEntryAction, saveEntryAction, saveNoteAction, statusEntryAction } from "../actions";
import { DecisionForm, GuardedForm, ReasonButton } from "./DecisionButtons";
import { PersonTabs, type PersonTabKey } from "./PersonTabs";

const text = directoryAdmin;
const detail = text.detail;

const notices: Record<string, string> = {
  created: "Added.",
  approved: "Approved. This person is now on the website.",
  update_needed: "Marked as needs an update.",
  rejected: "Rejected.",
  withdrawn: "Hidden from the website.",
  pending: "Set back to waiting.",
  note: detail.noteSaved,
};

const stamp = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Colombo",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function DirectoryEntryPage(props: PageProps<"/admin/directory/[id]">) {
  await requireAdmin();

  const id = Number((await props.params).id);
  if (!Number.isInteger(id) || id < 1) notFound();
  const sp = await props.searchParams;
  const notice = notices[first(sp.notice)];

  const [entry, fields, settings] = await Promise.all([getEntry(id), listFields(), getSettings()]);
  if (!entry) notFound();
  const activity = await listActivity(id);

  const initial: EntryFormState = { status: "idle", values: entryToValues(entry), shares: entry.shareChoices, errors: {} };
  const reviewerNotes = activity.filter((a) => a.action === "recommend_approve" || a.action === "recommend_fix");
  const approved = entry.status === "approved";
  const onSite = approved && entry.code && directoryEnabled(settings);
  const photoUrl = publicUrl(entry.photoKey);

  const tabs = [
    { key: "answers", label: detail.tabs.answers },
    { key: "reviewers", label: detail.tabs.reviewers, count: reviewerNotes.length },
    { key: "note", label: detail.tabs.note },
    { key: "history", label: detail.tabs.history },
  ] satisfies { key: PersonTabKey; label: string; count?: number }[];
  // The tab to open, kept in the address so a reload or a redirect can come back to the same tab.
  const initialTab = tabs.find((t) => t.key === first(sp.tab))?.key ?? "answers";

  const statusNote = approved ? detail.approvedNote : entry.status === "withdrawn" ? detail.hiddenNote : detail.pendingNote;
  const showReason = Boolean(entry.statusReason) && (entry.status === "update_needed" || entry.status === "rejected");

  return (
    <>
      <Link
        href="/admin/directory"
        className="-my-2 mb-1 inline-flex items-center gap-1.5 py-2 text-sm font-semibold text-muted transition-colors hover:text-brand"
      >
        <Icon name="arrowLeft" className="h-4 w-4" />
        {detail.back}
      </Link>

      {notice && <NoticeToast message={notice} />}

      {/* Who this is and what can be decided, always at the top. The decisions that need a reason open a small window. */}
      <section className={`${card} mb-6 p-4 sm:p-6`} aria-label={entry.name}>
        <div className="flex items-start gap-3 sm:items-center sm:gap-5">
          <Avatar name={entry.name} photoUrl={photoUrl} size="h-14 w-14 sm:h-20 sm:w-20" text="text-xl sm:text-2xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="text-2xl font-bold leading-tight text-brand-dark [overflow-wrap:anywhere] sm:text-3xl">{entry.name}</h1>
              <StatusBadge status={entry.status} />
            </div>
            <p className="mt-1.5 text-sm text-muted">
              {detail.codeLabel}: <span className="font-semibold text-ink">{entry.code ?? detail.waitingForCode}</span>
            </p>
            <p className="text-sm text-muted">
              {entry.source === "admin" ? text.list.addedByAdmin : text.list.fromWebsite} · {stamp.format(entry.submittedAt)}
            </p>
            <p className="mt-1 text-sm text-muted">{statusNote}</p>
          </div>
        </div>

        {showReason && (
          <p className="mt-4 rounded-xl bg-panel p-3 text-sm text-ink [overflow-wrap:anywhere]">
            <span className="font-semibold">{detail.reasonPrefix}: </span>
            {entry.statusReason}
          </p>
        )}

        {/* On a phone the buttons are one per row, full width. From the "sm" width they sit side by side. */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-line/70 pt-5 sm:flex sm:flex-wrap sm:items-center">
          {!approved && (
            // A transparent border makes this button exactly as tall as the outlined ones beside it.
            <div className="col-span-2 sm:contents">
              <DecisionForm action={approveEntryAction} id={entry.id} className={`${button.primary} border border-transparent max-sm:w-full`}>
                <Icon name={entry.status === "withdrawn" ? "eye" : "checkCircle"} className="h-5 w-5" />
                {entry.status === "withdrawn" ? detail.approveAgain : detail.approve}
              </DecisionForm>
            </div>
          )}

          {/* "Ask for an update" and "Reject" share a row on a phone. */}
          <div className="col-span-2 flex gap-2.5 sm:contents [&>button]:flex-1 sm:[&>button]:flex-none">
            {entry.status !== "update_needed" && (
              <ReasonButton
                action={statusEntryAction}
                id={entry.id}
                status="update_needed"
                label={detail.needsUpdate}
                icon="edit"
                title={detail.needsUpdate}
                help={detail.updateHelp}
                reasonLabel={detail.reasonLabel}
                placeholder={detail.reasonPlaceholder}
                confirmLabel={detail.confirmUpdate}
              />
            )}

            {entry.status !== "rejected" && (
              <ReasonButton
                action={statusEntryAction}
                id={entry.id}
                status="rejected"
                label={detail.reject}
                icon="x"
                title={detail.rejectTitle}
                help={detail.rejectHelp}
                reasonLabel={detail.reasonLabel}
                placeholder={detail.reasonPlaceholder}
                confirmLabel={detail.confirmReject}
                danger
              />
            )}
          </div>

          {approved && (
            <div className="col-span-2 sm:contents">
              <DecisionForm action={statusEntryAction} id={entry.id} status="withdrawn" className={`${button.secondary} max-sm:w-full`}>
                <Icon name="eyeOff" className="h-5 w-5" />
                {detail.withdraw}
              </DecisionForm>
            </div>
          )}

          {onSite && (
            <Link
              href={`/directory/${entry.code}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${button.secondary} max-sm:col-span-2`}
            >
              <Icon name="externalLink" className="h-5 w-5" />
              {detail.viewPublic}
            </Link>
          )}

          <div className="col-span-2 flex items-center justify-end gap-2 sm:ml-auto">
            <span className="text-sm font-semibold text-red-700">{detail.delete}</span>
            <DeleteButton
              action={deleteEntryAction}
              id={entry.id}
              label={detail.delete}
              title={detail.deleteTitle}
              confirmMessage={detail.deleteConfirm}
            />
          </div>
        </div>
      </section>

      <PersonTabs
        tabs={tabs}
        initial={initialTab}
        label={detail.tabsLabel}
        answers={
          <AdminEntryForm
            fields={fields}
            initial={initial}
            action={saveEntryAction}
            hidden={{ id: String(entry.id) }}
            photoUrl={photoUrl}
            saveLabel={detail.save}
            savingLabel={detail.saving}
            cancelHref="/admin/directory"
          />
        }
        reviewers={
          <section className={`${card} p-5 sm:p-6`} aria-labelledby="reviewers-title">
            <h2 id="reviewers-title" className="text-lg font-bold text-brand-dark">
              {detail.reviewersTitle}
            </h2>
            {reviewerNotes.length === 0 ? (
              <p className="mt-2 text-muted">{detail.noReviewers}</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {reviewerNotes.map((note) => (
                  <li
                    key={note.id}
                    className={`rounded-xl p-4 text-sm ${note.action === "recommend_approve" ? "bg-green-50 text-green-900" : "bg-sky-50 text-sky-900"}`}
                  >
                    <p className="font-bold">
                      {note.actor.replace(/^reviewer: /, "")}: {note.action === "recommend_approve" ? "looks good" : "needs a fix"}
                    </p>
                    {note.detail && <p className="mt-1 whitespace-pre-line [overflow-wrap:anywhere]">{note.detail}</p>}
                    <p className="mt-1 text-xs opacity-70">{stamp.format(note.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        }
        note={
          <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
            <section className={`${card} p-5 sm:p-6`} aria-labelledby="note-title">
              <h2 id="note-title" className="text-lg font-bold text-brand-dark">
                {detail.noteTitle}
              </h2>
              <p className="mt-1 text-sm text-muted">{detail.noteHelp}</p>
              <GuardedForm action={saveNoteAction} className="mt-3 space-y-3">
                <input type="hidden" name="id" value={entry.id} />
                <textarea name="note" rows={6} maxLength={2000} defaultValue={entry.adminNote} aria-label={detail.noteTitle} className={inputClass()} />
                <SubmitButton pendingLabel="Saving…" className={button.primary}>
                  <Icon name="save" className="h-5 w-5" />
                  {detail.noteSave}
                </SubmitButton>
              </GuardedForm>
            </section>

            <section className={`${card} p-5 sm:p-6`} aria-labelledby="consent-title">
              <h2 id="consent-title" className="text-lg font-bold text-brand-dark">
                {detail.consentTitle}
              </h2>
              {entry.consentAt ? (
                <>
                  <p lang="ta" className="mt-2 leading-relaxed text-ink">
                    {entry.consentText}
                  </p>
                  <p className="mt-2 text-xs text-muted">{stamp.format(entry.consentAt)}</p>
                </>
              ) : (
                <p className="mt-2 text-muted">{detail.consentNone}</p>
              )}
            </section>
          </div>
        }
        history={
          <section className={`${card} p-5 sm:p-6`} aria-labelledby="history-title">
            <h2 id="history-title" className="text-lg font-bold text-brand-dark">
              {detail.activityTitle}
            </h2>
            <ol className="mt-4 space-y-3">
              {activity.map((item) => (
                <li key={item.id} className="border-l-2 border-line pl-3 text-sm">
                  <p className="font-semibold text-ink">{text.activity[item.action] ?? item.action}</p>
                  {item.detail && <p className="text-muted [overflow-wrap:anywhere]">{item.detail}</p>}
                  <p className="text-xs text-muted">
                    {item.actor.replace(/^reviewer: /, "Reviewer ")} · {stamp.format(item.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        }
      />
    </>
  );
}
