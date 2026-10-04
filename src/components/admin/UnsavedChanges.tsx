"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { admin } from "@/content/admin-en";
import { Icon } from "./Icon";
import { button } from "./ui";

type UnsavedContext = {
  setDirty: (dirty: boolean) => void;
  // Returns true when nothing would be lost, so the caller can go ahead at once.
  // Otherwise it opens the "Leave without saving?" window and returns false; "proceed" runs only if the person leaves.
  confirmLeave: (proceed: () => void) => boolean;
};

const Context = createContext<UnsavedContext | null>(null);

// Remembers whether the page being edited has changes that are not saved yet,
// and asks before the person leaves through the menu. (Closing the tab is guarded by the browser itself.)
export function UnsavedProvider({ children }: { children: ReactNode }) {
  const dirty = useRef(false);
  const [pending, setPending] = useState<(() => void) | null>(null);

  const setDirty = useCallback((value: boolean) => {
    dirty.current = value;
  }, []);

  const confirmLeave = useCallback((proceed: () => void) => {
    if (!dirty.current) return true;
    setPending(() => proceed);
    return false;
  }, []);

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (!dirty.current) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  const value = useMemo(() => ({ setDirty, confirmLeave }), [setDirty, confirmLeave]);

  return (
    <Context.Provider value={value}>
      {children}
      {pending && (
        <LeaveDialog
          onStay={() => setPending(null)}
          onLeave={() => {
            const proceed = pending;
            dirty.current = false;
            setPending(null);
            proceed();
          }}
        />
      )}
    </Context.Provider>
  );
}

function LeaveDialog({ onStay, onLeave }: { onStay: () => void; onLeave: () => void }) {
  const text = admin.common.leaveDialog;
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="leave-title"
      onCancel={(event) => {
        event.preventDefault();
        onStay();
      }}
      className="m-auto w-[min(92vw,26rem)] rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-black/50"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/25 text-amber-800">
            <Icon name="alert" />
          </span>
          <div>
            <h2 id="leave-title" className="text-lg font-bold text-ink">
              {text.title}
            </h2>
            <p className="mt-1 text-muted">{text.message}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onStay} className={button.primary}>
            {text.stay}
          </button>
          <button type="button" onClick={onLeave} className={button.secondary}>
            {text.leave}
          </button>
        </div>
      </div>
    </dialog>
  );
}

// A form calls this with true while it has unsaved changes.
export function useUnsavedChanges(dirty: boolean) {
  const context = useContext(Context);
  useEffect(() => {
    context?.setDirty(dirty);
    return () => context?.setDirty(false);
  }, [context, dirty]);
}

export function useConfirmLeave() {
  const context = useContext(Context);
  return context?.confirmLeave ?? (() => true);
}
