"use client";

import { useId, useRef, type ReactNode } from "react";
import { admin } from "@/content/admin-en";
import { Icon, type IconName } from "./Icon";
import { SubmitButton } from "./SubmitButton";
import { button } from "./ui";

// A button that asks "are you sure?" in a small window before it does anything, then sends a form to the server action.
// (The red bin for deleting is the same idea, see DeleteButton.)
export function ConfirmButton({
  action,
  hidden,
  label,
  icon,
  title,
  message,
  confirmLabel,
  pendingLabel,
  keepLabel = admin.common.keep,
  className = button.small,
}: {
  action: (formData: FormData) => void | Promise<void>;
  hidden: Record<string, string | number>;
  label: ReactNode;
  icon?: IconName;
  title: string;
  message: string;
  confirmLabel: string;
  pendingLabel: string;
  keepLabel?: string;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className={className}>
        {icon && <Icon name={icon} className="h-4 w-4" />}
        {label}
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="m-auto w-[min(92vw,26rem)] rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-black/50"
      >
        <form action={action} className="p-6">
          {Object.entries(hidden).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-700">
              <Icon name="alert" />
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-ink">
                {title}
              </h2>
              <p className="mt-1 text-muted">{message}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={() => dialog.current?.close()} className={button.secondary}>
              {keepLabel}
            </button>
            <SubmitButton pendingLabel={pendingLabel} className={button.danger}>
              {confirmLabel}
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}
