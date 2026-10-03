import type { ReactNode } from "react";
import { Icon } from "./Icon";

export { inputClass } from "./ui";

export function Field({
  id,
  label,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-semibold text-ink">
        {label}
      </label>
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
