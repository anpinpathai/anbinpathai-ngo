"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "@/components/admin/Icon";

type Tone = "success" | "error" | "info";
type ToastItem = { id: number; tone: Tone; message: string };
export type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const quiet: ToastApi = { success: () => {}, error: () => {}, info: () => {} };
const ToastContext = createContext<ToastApi | null>(null);

// Small notices that appear in a corner and fade away: "Saved", "Deleted", "Could not save"...
// Use them instead of the browser's own pop-up boxes.
export function useToast(): ToastApi {
  return useContext(ToastContext) ?? quiet;
}

const looks: Record<Tone, { icon: IconName; ring: string; badge: string }> = {
  success: { icon: "checkCircle", ring: "border-green-200", badge: "bg-green-100 text-green-700" },
  error: { icon: "alert", ring: "border-red-200", badge: "bg-red-100 text-red-700" },
  info: { icon: "info", ring: "border-brand/20", badge: "bg-brand/10 text-brand" },
};

function ToastCard({
  item,
  closeLabel,
  onDismiss,
}: {
  item: ToastItem;
  closeLabel: string;
  onDismiss: (id: number) => void;
}) {
  // It stays while the mouse or keyboard is on it, and goes away on its own otherwise.
  const [held, setHeld] = useState(false);
  useEffect(() => {
    if (held) return;
    const timer = window.setTimeout(() => onDismiss(item.id), item.tone === "error" ? 8000 : 4500);
    return () => window.clearTimeout(timer);
  }, [held, item.id, item.tone, onDismiss]);

  const look = looks[item.tone];
  return (
    <div
      role={item.tone === "error" ? "alert" : "status"}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className={`toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-3.5 text-ink shadow-xl ${look.ring}`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${look.badge}`}>
        <Icon name={look.icon} className="h-5 w-5" />
      </span>
      <p className="min-w-0 flex-1 pt-1 text-[0.95rem] font-semibold leading-snug [overflow-wrap:anywhere]">
        {item.message}
      </p>
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label={closeLabel}
        title={closeLabel}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-panel hover:text-brand"
      >
        <Icon name="x" className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({
  children,
  placement = "top",
  closeLabel = "Close",
}: {
  children: ReactNode;
  // "top": top right on a computer, top centre on a phone (the admin). "bottom": above the radio bar (the public site).
  placement?: "top" | "bottom";
  closeLabel?: string;
}) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((item) => item.id !== id)), []);

  const show = useCallback((tone: Tone, message: string) => {
    const text = message.trim();
    if (!text) return;
    const id = nextId.current++;
    // The same message again replaces the old one, and only the three newest are kept.
    setItems((list) => [...list.filter((item) => !(item.tone === tone && item.message === text)), { id, tone, message: text }].slice(-3));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => show("success", message),
      error: (message) => show("error", message),
      info: (message) => show("info", message),
    }),
    [show],
  );

  const position =
    placement === "top"
      ? "inset-x-4 top-4 sm:inset-x-auto sm:right-6 sm:top-6 sm:items-end"
      : "inset-x-4 bottom-24 sm:bottom-24";

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className={`pointer-events-none fixed z-[70] flex flex-col items-center gap-2 ${position} ${
          placement === "bottom" ? "toasts-bottom" : ""
        }`}
      >
        {items.map((item) => (
          <ToastCard key={item.id} item={item} closeLabel={closeLabel} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
