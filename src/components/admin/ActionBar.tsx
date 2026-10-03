import type { ReactNode } from "react";
import { admin } from "@/content/admin-en";
import { Icon } from "./Icon";

// The bar with the Save / Cancel buttons at the bottom of a form.
// It is a floating card exactly as wide as the cards above it, and stays in reach while you scroll.
// What is happening ("unsaved changes", "saved") is on the left; the buttons are on the right.
// On a phone the message sits above the buttons and the buttons share the width.
export function ActionBar({ status, children }: { status?: ReactNode; children: ReactNode }) {
  return (
    <div className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-10 mt-8">
      <div className="flex flex-col rounded-2xl border border-line bg-white/95 p-3 shadow-[0_12px_32px_-10px_rgba(26,5,64,0.35)] backdrop-blur sm:flex-row sm:items-center sm:gap-4 sm:px-4">
        <div
          aria-live="polite"
          className="min-w-0 flex-1 px-1 text-sm font-semibold [&:not(:empty)]:pb-3 sm:[&:not(:empty)]:pb-0"
        >
          {status}
        </div>
        {/* On phones the buttons are a little smaller so three can share one row; on very narrow screens they wrap. */}
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:flex-nowrap [&>*]:whitespace-nowrap max-sm:[&>*]:px-3! max-sm:[&>*]:text-sm!">
          {children}
        </div>
      </div>
    </div>
  );
}

// The small message shown on the left of the bar.
export function FormStatus({
  dirty,
  status,
  message,
}: {
  dirty: boolean;
  status: "idle" | "saved" | "error";
  message?: string;
}) {
  if (dirty) {
    return (
      <span className="inline-flex items-center gap-2 text-muted">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold" />
        {admin.common.unsaved}
      </span>
    );
  }
  if (!message) return null;
  return (
    <span
      role={status === "error" ? "alert" : "status"}
      className={`inline-flex items-center gap-1.5 ${status === "error" ? "text-red-700" : "text-green-700"}`}
    >
      <Icon name={status === "error" ? "alert" : "checkCircle"} className="h-4 w-4" />
      {message}
    </span>
  );
}
