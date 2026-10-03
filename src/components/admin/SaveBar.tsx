import Link from "next/link";
import { admin } from "@/content/admin-en";
import { Icon, type IconName } from "./Icon";
import { button } from "./ui";

// The bar that stays at the bottom of a form, so Save is always in reach.
export function SaveBar({
  label,
  pendingLabel,
  pending,
  icon = "save",
  cancelHref,
  message,
  status,
  dirty,
  disabled,
}: {
  label: string;
  pendingLabel: string;
  pending: boolean;
  icon?: IconName;
  cancelHref?: string;
  message?: string;
  status: "idle" | "saved" | "error";
  dirty: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(26,5,64,0.18)] backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2">
        <button type="submit" disabled={pending || disabled} className={button.primary}>
          <Icon name={icon} className="h-5 w-5" />
          {pending ? pendingLabel : label}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className={button.secondary}>
            {admin.common.cancel}
          </Link>
        )}
        <div className="min-w-0 flex-1 text-sm font-semibold" aria-live="polite">
          {dirty ? (
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold" />
              {admin.common.unsaved}
            </span>
          ) : message ? (
            <span
              role={status === "error" ? "alert" : "status"}
              className={`inline-flex items-center gap-1.5 ${status === "error" ? "text-red-700" : "text-green-700"}`}
            >
              <Icon name={status === "error" ? "alert" : "checkCircle"} className="h-4 w-4" />
              {message}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
