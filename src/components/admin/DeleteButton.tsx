"use client";

import { useRef } from "react";
import { admin } from "@/content/admin-en";
import { Icon } from "./Icon";
import { SubmitButton } from "./SubmitButton";
import { button } from "./ui";

// A red bin button. Pressing it opens a clear "are you sure?" window before anything is deleted.
export function DeleteButton({
  action,
  id,
  label,
  title,
  confirmMessage,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: number;
  label: string;
  title: string;
  confirmMessage: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label={label}
        title={label}
        className={button.smallDanger}
      >
        <Icon name="trash" className="h-4 w-4" />
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={`delete-title-${id}`}
        className="m-auto w-[min(92vw,26rem)] rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-black/50"
      >
        <form action={action} className="p-6">
          <input type="hidden" name="id" value={id} />
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-700">
              <Icon name="trash" />
            </span>
            <div>
              <h2 id={`delete-title-${id}`} className="text-lg font-bold text-ink">
                {title}
              </h2>
              <p className="mt-1 text-muted">{confirmMessage}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" onClick={() => dialog.current?.close()} className={button.secondary}>
              {admin.common.keep}
            </button>
            <SubmitButton pendingLabel={admin.common.deleting} className={button.danger}>
              {admin.common.yesDelete}
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}
