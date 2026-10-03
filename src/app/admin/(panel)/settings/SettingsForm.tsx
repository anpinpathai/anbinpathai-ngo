"use client";

import { useActionState, useState } from "react";
import { Field, describedBy, inputClass } from "@/components/admin/Field";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SaveBar } from "@/components/admin/SaveBar";
import { useUnsavedChanges } from "@/components/admin/UnsavedChanges";
import { card } from "@/components/admin/ui";
import { admin, settingSections } from "@/content/admin-en";
import { saveSettingsAction, type SettingsState } from "./actions";

export function SettingsForm({
  section: slug,
  initialValues,
  imageUrls,
}: {
  section: string;
  initialValues: Record<string, string>;
  imageUrls: Record<string, string | null>;
}) {
  const section = settingSections.find((s) => s.slug === slug);
  const initial: SettingsState = { status: "idle", values: initialValues, errors: {} };
  const [state, action, pending] = useActionState(saveSettingsAction, initial);

  // "Edited" means something changed since the last result from the server.
  const [editedAt, setEditedAt] = useState<SettingsState | null>(null);
  const dirty = editedAt === state;
  useUnsavedChanges(dirty);
  const markEdited = () => setEditedAt(state);

  if (!section) return null;

  return (
    <form action={action} onInput={markEdited}>
      <input type="hidden" name="section" value={section.slug} />

      <div className="space-y-6">
        {section.groups.map((group) => (
          <fieldset key={group.title} className={`${card} min-w-0 p-5 sm:p-6`}>
            <legend className="sr-only">{group.title}</legend>
            {section.groups.length > 1 && (
              <h2 className="mb-5 text-lg font-bold text-brand-dark" aria-hidden="true">
                {group.title}
              </h2>
            )}
            <div className="space-y-6">
              {group.fields.map((field) => {
                const id = `field-${field.key}`;
                const value = state.values[field.key] ?? "";
                const error = state.errors[field.key];

                if (field.type === "image") {
                  return (
                    <div key={field.key}>
                      <p className="font-semibold text-ink">{field.label}</p>
                      {field.help && <p className="mb-3 text-sm text-muted">{field.help}</p>}
                      <ImageUploader
                        name={field.key}
                        initialKey={value}
                        initialUrl={imageUrls[field.key] ?? null}
                        error={error}
                        onChange={markEdited}
                      />
                    </div>
                  );
                }

                if (field.type === "toggle") {
                  // The tick box comes first so a ticked box wins; the hidden "0" is sent only when it is not ticked.
                  return (
                    <label key={field.key} htmlFor={id} className="flex cursor-pointer items-start gap-4">
                      <input
                        id={id}
                        type="checkbox"
                        name={field.key}
                        value="1"
                        defaultChecked={value !== "0"}
                        className="peer sr-only"
                      />
                      <input type="hidden" name={field.key} value="0" />
                      <span
                        aria-hidden="true"
                        className="relative mt-0.5 h-7 w-12 shrink-0 rounded-full bg-muted/40 transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-green-600 peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-gold"
                      />
                      <span className="min-w-0">
                        <span className="block font-semibold text-ink">{field.label}</span>
                        {field.help && <span className="block text-sm text-muted">{field.help}</span>}
                      </span>
                    </label>
                  );
                }

                return (
                  <Field key={field.key} id={id} label={field.label} help={field.help} error={error}>
                    {field.type === "textarea" ? (
                      <textarea
                        id={id}
                        name={field.key}
                        defaultValue={value}
                        lang={field.lang}
                        rows={4}
                        maxLength={field.maxLength}
                        aria-invalid={Boolean(error)}
                        aria-describedby={describedBy(id, field.help, error)}
                        className={inputClass(error)}
                      />
                    ) : (
                      <input
                        id={id}
                        name={field.key}
                        type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
                        inputMode={
                          field.type === "facebook" || field.type === "youtube" || field.type === "url" ? "url" : undefined
                        }
                        defaultValue={value}
                        lang={field.lang}
                        maxLength={field.maxLength}
                        aria-invalid={Boolean(error)}
                        aria-describedby={describedBy(id, field.help, error)}
                        className={inputClass(error)}
                      />
                    )}
                  </Field>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <SaveBar
        label={admin.settings.save}
        pendingLabel={admin.settings.saving}
        pending={pending}
        message={state.message}
        status={state.status}
        dirty={dirty}
      />
    </form>
  );
}
