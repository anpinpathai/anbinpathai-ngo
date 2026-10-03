"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { admin } from "@/content/admin-en";

type UnsavedContext = {
  setDirty: (dirty: boolean) => void;
  confirmLeave: () => boolean;
};

const Context = createContext<UnsavedContext | null>(null);

// Remembers whether the page being edited has changes that are not saved yet,
// and asks before the person leaves (closing the tab, or using the menu).
export function UnsavedProvider({ children }: { children: ReactNode }) {
  const dirty = useRef(false);

  const setDirty = useCallback((value: boolean) => {
    dirty.current = value;
  }, []);

  const confirmLeave = useCallback(() => !dirty.current || window.confirm(admin.nav.unsavedLeave), []);

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
  return <Context.Provider value={value}>{children}</Context.Provider>;
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
