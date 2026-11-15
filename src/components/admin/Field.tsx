import type { ReactNode } from "react";
import { Icon } from "./Icon";

export { inputClass } from "./ui";

export function Field({
  id,
  label,
  help,
  error,
  aside,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  // A small tag or button at the right end of the label's line.
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      {aside ? (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <label htmlFor={id} className="font-semibold text-ink">
            {label}
          </label>
          {aside}
        </div>
      ) : (
        <label htmlFor={id} className="font-semibold text-ink">
          {label}
        </label>
      )}
      {help && (
        <p id={`${id}-help`} className="text-sm text-muted [overflow-wrap:anywhere]">
          {help}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-red-700">
          <Icon name="alert" className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, help?: string, error?: string) {
  return [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}
