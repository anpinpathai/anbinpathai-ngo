"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { CopyField } from "@/components/admin/CopyField";
import { Icon } from "@/components/admin/Icon";
import { Modal } from "@/components/admin/Modal";
import { button, inputClass } from "@/components/admin/ui";
import { useToast } from "@/components/toast/ToastProvider";
import { directoryAdmin } from "@/content/admin-directory-en";
import { admin } from "@/content/admin-en";
import { sendToReviewersAction, type SentToReviewer } from "@/app/admin/(panel)/directory/reviews/actions";

const list = directoryAdmin.list;
const text = directoryAdmin.reviews;
const send = text.send;

const BOXES = 'input[type="checkbox"][name="id"]';

export type SendReviewer = {
  id: number;
  name: string;
  working: boolean;
  canSeePrivate: boolean;
  people: number;
  until: string;
};

// The bar above the list of people ("select all", how many are ticked, the Send for review button) and the window that
// opens from it. The list itself is given as `children`; its tick boxes are the ones named "id".
export function SendForReview({ reviewers, total, children }: { reviewers: SendReviewer[]; total: number; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const allBox = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(0);
  const [boxCount, setBoxCount] = useState(0);
  const [ids, setIds] = useState<number[] | null>(null);

  const boxes = useCallback(() => Array.from(root.current?.querySelectorAll<HTMLInputElement>(BOXES) ?? []), []);

  // Counts the ticked boxes whenever one changes (and once at the start, in case the browser kept the ticks).
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const count = () => {
      const all = boxes();
      setBoxCount(all.length);
      setSelected(all.filter((box) => box.checked).length);
    };
    const start = window.setTimeout(count, 0);
    element.addEventListener("change", count);
    return () => {
      window.clearTimeout(start);
      element.removeEventListener("change", count);
    };
  }, [boxes]);

  // "Select all" is half-ticked while only some people are ticked.
  useEffect(() => {
    if (allBox.current) allBox.current.indeterminate = selected > 0 && selected < boxCount;
  }, [selected, boxCount]);

  function tickAll(checked: boolean) {
    for (const box of boxes()) box.checked = checked;
    setSelected(checked ? boxes().length : 0);
  }

  function open() {
    setIds(
      boxes()
        .filter((box) => box.checked)
        .map((box) => Number(box.value)),
    );
  }

  const ticked = selected > 0;

  return (
    <div ref={root}>
      {/* On a phone, once someone is ticked this bar floats under the top bar while the list scrolls, so "Send for review"
          is always in reach (no scrolling back up). It keeps the same height before and after the first tick, so the list
          does not jump under a finger. From the "lg" width the menu is at the side and the bar is a plain row. */}
      <div
        className={`mb-3 flex items-center justify-between gap-x-4 gap-y-3 max-lg:h-[3.6rem] max-lg:rounded-xl max-lg:border max-lg:px-3 max-lg:py-1.5 sm:flex-wrap ${
          ticked
            ? "max-lg:sticky max-lg:top-[4.5rem] max-lg:z-10 max-lg:border-line max-lg:bg-white/95 max-lg:shadow-md max-lg:backdrop-blur"
            : "max-lg:border-transparent"
        }`}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 py-1.5 text-sm font-semibold text-muted">
            <input
              ref={allBox}
              type="checkbox"
              checked={boxCount > 0 && selected === boxCount}
              onChange={(event) => tickAll(event.target.checked)}
              className="h-5 w-5 accent-brand"
            />
            {/* While the bar floats on a phone the tick box alone is enough; the count beside it says what is happening. */}
            <span className={ticked ? "max-lg:sr-only" : undefined}>{list.selectAll}</span>
          </label>
          <span aria-live="polite" className="text-sm text-muted">
            {ticked ? (
              <>
                <span className="font-bold text-ink">{selected}</span> {list.selected}
              </>
            ) : (
              list.count(total)
            )}
          </span>
        </div>
        {/* With nobody ticked, a phone has nothing to press, so the button waits until the first tick. */}
        <button
          type="button"
          disabled={!ticked}
          title={ticked ? undefined : list.selectedHelp}
          onClick={open}
          className={`${ticked ? button.primary : `${button.secondary} max-sm:hidden`} shrink-0 max-lg:h-11 max-sm:!px-4`}
        >
          <Icon name="send" className="h-4 w-4" />
          {list.sendForReview}
        </button>
      </div>

      {children}

      {ids && (
        <SendDialog
          entryIds={ids}
          reviewers={reviewers}
          onClose={() => setIds(null)}
          onDone={() => {
            tickAll(false);
            setIds(null);
          }}
        />
      )}
    </div>
  );
}

function SendDialog({
  entryIds,
  reviewers,
  onClose,
  onDone,
}: {
  entryIds: number[];
  reviewers: SendReviewer[];
  onClose: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<SentToReviewer[] | null>(null);
  const [pending, startTransition] = useTransition();

  const needle = query.trim().toLowerCase();
  // Reviewers whose link has run out cannot be picked, so they go to the bottom of the list (the order is otherwise kept).
  const shown = reviewers.filter((r) => !needle || r.name.toLowerCase().includes(needle)).sort((a, b) => Number(b.working) - Number(a.working));
  const usable = shown.filter((r) => r.working);
  const everyShownPicked = usable.length > 0 && usable.every((r) => picked.has(r.id));

  function toggle(id: number) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setPicked((prev) => {
      const next = new Set(prev);
      for (const r of usable) {
        if (everyShownPicked) next.delete(r.id);
        else next.add(r.id);
      }
      return next;
    });
  }

  function submit() {
    if (pending) return;
    if (picked.size === 0) return setError(send.pickOne);
    setError(null);
    startTransition(async () => {
      const result = await sendToReviewersAction({ entryIds, reviewIds: [...picked] });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(result.sent);
      toast.success(send.doneTitle);
      router.refresh();
    });
  }

  if (sent) {
    return (
      <Modal
        title={send.doneTitle}
        onClose={onDone}
        closeLabel={text.close}
        wide
        footer={
          <button type="button" onClick={onDone} className={button.primary}>
            {text.done}
          </button>
        }
      >
        <p className="mb-4 rounded-xl bg-gold/20 p-3 text-sm font-semibold text-ink">{send.doneHelp}</p>
        <ul className="space-y-4">
          {sent.map((r) => (
            <li key={r.reviewId} className="rounded-xl border border-line bg-white p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-lg font-semibold text-ink [overflow-wrap:anywhere]">{r.reviewerName}</p>
                <p className="text-sm text-muted">
                  {r.added > 0 ? send.added(r.added) : send.nobodyNew}
                  {r.already > 0 && ` · ${send.alreadyThere(r.already)}`}
                </p>
              </div>
              <div className="mt-3 space-y-3">
                {r.link && <CopyField label={text.linkLabel} value={r.link} copyLabel={text.copy} copiedLabel={text.copied} />}
                {r.password && (
                  <CopyField
                    label={text.passwordLabel}
                    value={r.password}
                    secret
                    copyLabel={text.copy}
                    copiedLabel={text.copied}
                    showLabel={text.show}
                    hideLabel={text.hide}
                  />
                )}
                {(!r.link || !r.password) && <p className="text-sm font-semibold text-amber-800">{text.notShown}</p>}
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    );
  }

  return (
    <Modal
      title={send.title}
      onClose={onClose}
      closeLabel={text.close}
      footer={
        <>
          {error && (
            <p role="alert" className="mr-auto text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          <button type="button" onClick={onClose} className={button.ghost}>
            {admin.common.cancel}
          </button>
          <button type="button" onClick={submit} disabled={pending || picked.size === 0} className={button.primary}>
            <Icon name="send" className="h-4 w-4" />
            {pending ? send.sending : send.button}
          </button>
        </>
      }
    >
      <p className="text-muted">{send.help(entryIds.length)}</p>

      {reviewers.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-line p-6 text-center">
          <p className="font-semibold text-ink">{send.none}</p>
          <p className="mt-1 text-sm text-muted">{send.noneHelp}</p>
          <Link href="/admin/directory/reviews" className={`${button.gold} mt-4 border border-transparent`}>
            <Icon name="plus" className="h-5 w-5" />
            {send.addOne}
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-muted">
              <input type="checkbox" checked={everyShownPicked} onChange={toggleAll} disabled={usable.length === 0} className="h-5 w-5 accent-brand" />
              {send.selectAll}
            </label>
            <span aria-live="polite" className="text-sm text-muted">
              {send.selected(picked.size)}
            </span>
            {picked.size > 0 && (
              <button type="button" onClick={() => setPicked(new Set())} className="text-sm font-semibold text-brand hover:underline">
                {send.clear}
              </button>
            )}
            {reviewers.length > 6 && (
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={send.search}
                aria-label={send.search}
                className={`${inputClass()} !mt-0 !py-2 text-sm sm:ml-auto sm:max-w-[14rem]`}
              />
            )}
          </div>

          <ul className="mt-3 max-h-[46dvh] divide-y divide-line/70 overflow-y-auto rounded-xl border border-line bg-white">
            {shown.map((r) => (
              <li key={r.id}>
                <label
                  className={`flex items-start gap-3 px-3 py-3 transition-colors ${r.working ? "cursor-pointer hover:bg-sand/40" : "cursor-not-allowed bg-panel/60"}`}
                >
                  <input
                    type="checkbox"
                    checked={picked.has(r.id)}
                    onChange={() => toggle(r.id)}
                    disabled={!r.working}
                    className="mt-1 h-5 w-5 shrink-0 accent-brand"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink [overflow-wrap:anywhere]">{r.name}</span>
                    <span className="block text-sm text-muted">
                      {send.onList(r.people)} · {send.until(r.until)} · {text.privateShort}: {r.canSeePrivate ? text.yes : text.no}
                    </span>
                    {!r.working && <span className="block text-sm font-semibold text-amber-800">{send.expiredHint}</span>}
                  </span>
                  {!r.working && <span className="rounded-full bg-panel px-2.5 py-0.5 text-xs font-bold text-muted">{send.expired}</span>}
                </label>
              </li>
            ))}
            {shown.length === 0 && <li className="px-4 py-6 text-center text-muted">{send.noMatch}</li>}
          </ul>
        </>
      )}
    </Modal>
  );
}
