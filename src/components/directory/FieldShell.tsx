import type { ReactNode } from "react";
import type { DirectoryFieldRow } from "@/lib/directory/config";
import type { FormUi } from "@/lib/directory/ui-text";

export type FormMode = "public" | "admin" | "reviewer";

export function inputClass(error?: string) {
  return `mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-base text-ink placeholder:text-muted/70 transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25 ${
    error ? "border-red-600" : "border-line"
  }`;
}

// One question: its label, help text, the answer box, the error, and the "show this publicly" tick.
//
// Lining up: on a wide screen every question takes four rows of its group's grid (label, help line, answer box, and
// error + tick) and shares them with the question beside it (a "subgrid"). So the answer boxes of one row always
// start at the same height, however long the labels or the help lines are. `full` makes the question as wide as the
// whole row. On a phone the questions simply follow each other.
export function FieldShell({
  field,
  id,
  error,
  ui,
  mode,
  shared,
  full = false,
  children,
}: {
  field: DirectoryFieldRow;
  id: string;
  error?: string;
  ui: FormUi;
  mode: FormMode;
  shared: boolean;
  full?: boolean;
  children: ReactNode;
}) {
  const needed = mode === "public" ? field.required : field.key === "name";
  // The admin sees English tags; visitors and reviewers see Tamil ones. Only the admin is told which answers are public.
  const note =
    field.visibility === "private"
      ? mode === "admin"
        ? "Private"
        : ui.privateNote
      : field.visibility === "public" && mode === "admin"
        ? "Public"
        : null;

  return (
    <div className={`min-w-0 pb-5 sm:row-span-4 sm:grid sm:grid-rows-subgrid ${full ? "sm:col-span-2" : ""}`} data-field={field.key}>
      <div className="row-start-1 flex min-w-0 flex-wrap items-baseline justify-between gap-x-3">
        <label id={`${id}-label`} htmlFor={id} className="font-semibold text-ink">
          {field.label}
          {needed && (
            <span aria-hidden="true" className="ml-1 text-red-700">
              *
            </span>
          )}
          {needed && <span className="sr-only"> ({ui.required})</span>}
        </label>
        {note && (
          <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-muted" lang={mode === "admin" ? "en" : "ta"}>
            {field.visibility === "private" ? "🔒 " : ""}
            {note}
          </span>
        )}
      </div>
      <div className="row-start-2 min-w-0">
        {field.help && (
          <p id={`${id}-help`} className="text-sm text-muted [overflow-wrap:anywhere]">
            {field.help}
          </p>
        )}
      </div>
      <div className="row-start-3 min-w-0">{children}</div>
      <div className="row-start-4 min-w-0">
        {error && (
          <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        {/* The tick is the person's own choice, so a reviewer is not shown it and cannot change it. */}
        {field.visibility === "applicant" && mode !== "reviewer" && (
          // The label is the part to press, and it is taller than the little box, so a thumb can hit it.
          <label className="mt-1 flex cursor-pointer items-center gap-2.5 py-2 text-sm text-ink">
            <input type="checkbox" name={`share:${field.key}`} value="1" defaultChecked={shared} className="h-5 w-5 shrink-0 accent-brand" />
            {ui.shareLabel}
          </label>
        )}
      </div>
    </div>
  );
}
