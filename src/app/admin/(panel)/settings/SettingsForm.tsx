"use client";

import { useActionState } from "react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { admin, settingGroups } from "@/content/admin-en";
import { saveSettingsAction, type SettingsState } from "./actions";

const inputClass =
  "mt-1 w-full rounded-lg border bg-white px-3 py-2.5 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

export function SettingsForm({
  initialValues,
  imageUrls,
}: {
  initialValues: Record<string, string>;
  imageUrls: Record<string, string | null>;
}) {
  const initial: SettingsState = { status: "idle", values: initialValues, errors: {} };
  const [state, action, pending] = useActionState(saveSettingsAction, initial);

  return (
    <form action={action} className="space-y-8">
      {settingGroups.map((group) => (
        <fieldset key={group.title} className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <legend className="px-2 font-heading text-xl font-bold text-brand">{group.title}</legend>
          <div className="mt-2 space-y-5">
            {group.fields.map((field) => {
              const id = `field-${field.key}`;
              const value = state.values[field.key] ?? "";
              const error = state.errors[field.key];
              const describedBy = [field.help ? `${id}-help` : null, error ? `${id}-error` : null]
                .filter(Boolean)
                .join(" ");

              return (
                <div key={field.key}>
                  <label htmlFor={field.type === "image" ? undefined : id} className="font-semibold">
                    {field.label}
                  </label>
                  {field.help && (
                    <p id={`${id}-help`} className="text-sm text-muted">
                      {field.help}
                    </p>
                  )}

                  {field.type === "image" ? (
                    <div className="mt-2">
                      <ImageUploader
                        name={field.key}
                        initialKey={value}
                        initialUrl={imageUrls[field.key] ?? null}
                        error={error}
                      />
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={id}
                      name={field.key}
                      defaultValue={value}
                      lang={field.lang}
                      rows={4}
                      maxLength={field.maxLength}
                      aria-invalid={Boolean(error)}
                      aria-describedby={describedBy || undefined}
                      className={`${inputClass} ${error ? "border-red-600" : "border-line"}`}
                    />
                  ) : (
                    <input
                      id={id}
                      name={field.key}
                      type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
                      inputMode={field.type === "facebook" || field.type === "youtube" ? "url" : undefined}
                      defaultValue={value}
                      lang={field.lang}
                      maxLength={field.maxLength}
                      aria-invalid={Boolean(error)}
                      aria-describedby={describedBy || undefined}
                      className={`${inputClass} ${error ? "border-red-600" : "border-line"}`}
                    />
                  )}

                  {error && field.type !== "image" && (
                    <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-red-700">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 border-t border-line bg-cream/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-8 py-2.5 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? admin.settings.saving : admin.settings.save}
        </button>
        {state.message && (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={`font-semibold ${state.status === "error" ? "text-red-700" : "text-cat-green"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
