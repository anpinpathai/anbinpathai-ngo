"use client";

import type { DirectoryVisibility } from "@/db/schema";

// The small controls the question cards and the "Add a question" window share, so they always look the same.

export function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      // The invisible "before" box makes the area to press bigger than the switch itself (a finger needs about 44px).
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors before:absolute before:-inset-x-1.5 before:-inset-y-2.5 focus-visible:ring-4 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-green-600" : "bg-muted/40"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

const VISIBILITY_SHORT: { value: DirectoryVisibility; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "applicant", label: "Person chooses" },
];

// Public / Private / Person chooses, as one row of three buttons.
export function VisibilityPicker({
  value,
  onChange,
  label,
  disabled = false,
  onlyPublic = false,
}: {
  value: DirectoryVisibility;
  onChange: (value: DirectoryVisibility) => void;
  label: string;
  disabled?: boolean;
  // The name and the place can never be private, so only "Public" can be chosen for them.
  onlyPublic?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex max-w-full overflow-hidden rounded-xl border border-line">
      {VISIBILITY_SHORT.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={disabled || (onlyPublic && option.value !== "public")}
          onClick={() => onChange(option.value)}
          className={`h-9 whitespace-nowrap px-2.5 text-sm font-semibold transition-colors focus-visible:relative focus-visible:ring-4 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 ${
            value === option.value ? "bg-brand text-white" : "bg-white text-brand hover:bg-sand/60"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
