"use client";

import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react";
import { admin } from "@/content/admin-en";
import { Icon } from "./Icon";
import { button } from "./ui";

// A pop-up window for the admin panel: the page behind goes dark and cannot be clicked, Esc closes it, and the body
// scrolls on a small screen while the title and the buttons stay in view. It is only on the page while it is open
// (the page that uses it decides when), so every time it opens it starts fresh. Give `onSubmit` to make the whole
// window one form.
export function Modal({
  title,
  onClose,
  children,
  footer,
  onSubmit,
  wide = false,
  closeLabel = admin.common.cancel,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  wide?: boolean;
  closeLabel?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  const inner = (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
        <h2 id={titleId} className="text-lg font-bold text-brand-dark">
          {title}
        </h2>
        <button type="button" onClick={onClose} aria-label={closeLabel} title={closeLabel} className={button.icon}>
          <Icon name="x" className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      {footer && <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-panel/60 px-5 py-4 sm:px-6">{footer}</div>}
    </>
  );

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // The Esc key: our own state closes it (the window is taken off the page, which closes it).
        event.preventDefault();
        onClose();
      }}
      className={`m-auto max-h-[92dvh] ${wide ? "w-[min(94vw,44rem)]" : "w-[min(94vw,36rem)]"} overflow-hidden rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-black/50`}
    >
      {onSubmit ? (
        <form onSubmit={onSubmit} noValidate className="flex max-h-[92dvh] flex-col">
          {inner}
        </form>
      ) : (
        <div className="flex max-h-[92dvh] flex-col">{inner}</div>
      )}
    </dialog>
  );
}
