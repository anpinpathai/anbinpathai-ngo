"use client";

import type { DirectoryFieldRow } from "@/lib/directory/config";
import type { FormUi } from "@/lib/directory/ui-text";
import { inputClass } from "./FieldShell";
import { PhotoInput } from "./PhotoInput";

// The answer box of one question, whatever its kind (short answer, long answer, list, tick boxes, photo ...).
export function FieldControl({
  field,
  value,
  error,
  ui,
  uploadUrl,
  photoUrl,
  onPhotoChange,
  roomy = false,
}: {
  field: DirectoryFieldRow;
  value: string | string[] | undefined;
  error?: string;
  ui: FormUi;
  uploadUrl: string | null;
  photoUrl: string | null;
  onPhotoChange?: () => void;
  // The admin form is wide: drop-down lists get our own arrow and the tick boxes use more columns.
  roomy?: boolean;
}) {
  const id = `f-${field.key}`;
  const text = typeof value === "string" ? value : "";
  const describedBy = [field.help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  const aria = { "aria-invalid": Boolean(error), "aria-describedby": describedBy };

  switch (field.type) {
    case "date":
      // The browser's own calendar (on a phone, the phone's date picker). It sends "1985-03-21"; the server checks the date.
      return <input id={id} name={field.key} type="date" min="1900-01-01" defaultValue={text} {...aria} className={inputClass(error)} />;
    case "textarea":
    case "links":
      return (
        <textarea
          id={id}
          name={field.key}
          defaultValue={text}
          rows={field.key === "bio" ? 8 : field.type === "links" ? 3 : 4}
          placeholder={field.type === "links" ? "https://…" : undefined}
          {...aria}
          className={inputClass(error)}
        />
      );
    case "select":
      return (
        <select id={id} name={field.key} defaultValue={text} {...aria} className={roomy ? `${inputClass(error)} select-arrow` : inputClass(error)}>
          <option value="">{ui.choose}</option>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case "multiselect": {
      const picked = Array.isArray(value) ? value : [];
      return (
        <div id={id} className={`mt-2 grid gap-2 sm:grid-cols-2 ${roomy ? "lg:grid-cols-3 xl:grid-cols-4" : ""}`} role="group">
          {field.options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2 text-[0.95rem] text-ink transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/40"
            >
              <input type="checkbox" name={field.key} value={option} defaultChecked={picked.includes(option)} className="h-4 w-4 accent-brand" />
              {option}
            </label>
          ))}
        </div>
      );
    }
    case "photo":
      return uploadUrl ? (
        <PhotoInput name={field.key} initialKey={text} initialUrl={photoUrl} uploadUrl={uploadUrl} ui={ui} error={error} onChange={onPhotoChange} />
      ) : (
        <input type="hidden" name={field.key} defaultValue={text} />
      );
    default:
      return (
        <input
          id={id}
          name={field.key}
          type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
          inputMode={field.type === "number" ? "numeric" : field.type === "url" ? "url" : undefined}
          maxLength={field.type === "number" ? 9 : field.key === "name" ? 120 : 300}
          defaultValue={text}
          autoComplete={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "off"}
          {...aria}
          className={inputClass(error)}
        />
      );
  }
}
