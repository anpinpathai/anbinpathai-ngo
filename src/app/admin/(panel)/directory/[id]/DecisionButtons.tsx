"use client";

import { useId, useRef, type ReactNode } from "react";
import { Icon } from "@/components/admin/Icon";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { useConfirmLeave } from "@/components/admin/UnsavedChanges";
import { button, inputClass } from "@/components/admin/ui";
import { admin } from "@/content/admin-en";

type EntryAction = (formData: FormData) => void | Promise<void>;

// The decision buttons are always in view at the top of the page, next to the answers that can be edited below.
// Pressing one reloads the page, which would throw away answers that were changed but not saved. So when there are
// such changes, each of them asks first ("Leave without saving?"), and a typo fix is not lost by accident.

// A form that sends only after that question, when there is something to lose.
export function GuardedForm({ action, className, children }: { action: EntryAction; className?: string; children: ReactNode }) {
  const confirmLeave = useConfirmLeave();
  const form = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={form}
      action={action}
      className={className}
      onSubmit={(event) => {
        // When changes would be lost, stop here. The "Leave without saving?" window sends the form again if the admin leaves.
        if (!confirmLeave(() => form.current?.requestSubmit())) event.preventDefault();
      }}
    >
      {children}
    </form>
  );
}

// One button that decides at once (approve, hide, show again).
export function DecisionForm({
  action,
  id,
  status,
  className,
  children,
}: {
  action: EntryAction;
  id: number;
  status?: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <GuardedForm action={action}>
      <input type="hidden" name="id" value={id} />
      {status && <input type="hidden" name="status" value={status} />}
      <SubmitButton pendingLabel="Working…" className={className}>
        {children}
      </SubmitButton>
    </GuardedForm>
  );
}

// A button that opens a small window to write the reason first (ask for an update, reject).
export function ReasonButton({
  action,
  id,
  status,
  label,
  icon,
  title,
  help,
  reasonLabel,
  placeholder,
  confirmLabel,
  danger = false,
}: {
  action: EntryAction;
  id: number;
  status: string;
  label: string;
  icon: "edit" | "x";
  title: string;
  help: string;
  reasonLabel: string;
  placeholder: string;
  confirmLabel: string;
  danger?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const confirmLeave = useConfirmLeave();
  const uid = useId();
  const titleId = `${uid}-title`;
  const reasonId = `${uid}-reason`;

  function open() {
    const show = () => dialog.current?.showModal();
    if (confirmLeave(show)) show();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        // On a phone the two buttons share a row (see the page), so they are a little smaller there.
        className={`${
          danger
            ? "inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 py-2.5 font-semibold text-red-700 transition-colors hover:border-red-200 hover:bg-red-50"
            : button.secondary
        } max-sm:min-w-0 max-sm:!px-2 max-sm:text-[0.85rem]`}
      >
        {/* The little picture is left out on a phone: there the two buttons share a row and the words need all the room. */}
        <Icon name={icon} className="h-5 w-5 max-sm:hidden" />
        {label}
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="m-auto w-[min(92vw,28rem)] rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-black/50"
      >
        <form action={action} className="p-6">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={status} />
          <h2 id={titleId} className="text-lg font-bold text-ink">
            {title}
          </h2>
          <p className="mt-1 text-muted">{help}</p>
          <label htmlFor={reasonId} className="mt-4 block text-sm font-semibold text-ink">
            {reasonLabel}
          </label>
          <textarea id={reasonId} name="reason" rows={4} maxLength={1000} placeholder={placeholder} className={inputClass()} />
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={() => dialog.current?.close()} className={button.ghost}>
              {admin.common.cancel}
            </button>
            <SubmitButton pendingLabel="Working…" className={danger ? button.danger : button.primary}>
              {confirmLabel}
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}
