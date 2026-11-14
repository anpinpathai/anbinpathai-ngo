"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { Icon } from "@/components/admin/Icon";
import { button, inputClass } from "@/components/admin/ui";
import { useToast } from "@/components/toast/ToastProvider";
import { directoryAdmin } from "@/content/admin-directory-en";
import { admin } from "@/content/admin-en";
import { DIRECTORY_FIELD_TYPES, type DirectoryFieldType, type DirectoryVisibility } from "@/db/schema";
import { SECTIONS, TYPE_LABEL_EN } from "@/lib/directory/config";
import { createFieldAction } from "./actions";
import { Switch, VisibilityPicker } from "./controls";

const text = directoryAdmin.fields;

// The "Add a question" window. It is only on the page while it is open, so every time it opens it starts empty.
export function AddQuestionDialog({
  defaultSection,
  onClose,
  onCreated,
}: {
  defaultSection: string;
  onClose: () => void;
  onCreated: (section: string, id: number | null) => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const dialog = useRef<HTMLDialogElement>(null);
  const firstField = useRef<HTMLInputElement>(null);

  const [label, setLabel] = useState("");
  const [help, setHelp] = useState("");
  const [type, setType] = useState<DirectoryFieldType>("text");
  const [section, setSection] = useState(defaultSection);
  const [options, setOptions] = useState("");
  const [required, setRequired] = useState(false);
  const [visibility, setVisibility] = useState<DirectoryVisibility>("private");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isList = type === "select" || type === "multiselect";

  // Open as a real window (the page behind goes dark and cannot be clicked), with the cursor in the first box.
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    firstField.current?.focus();
    return () => element?.close();
  }, []);

  function create(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    if (!label.trim()) {
      setError(text.needLabel);
      firstField.current?.focus();
      return;
    }
    startTransition(async () => {
      const result = await createFieldAction({ label, help, options, type, section, required, visibility });
      if (!result.ok) {
        setError(result.error ?? text.saveFailed);
        return;
      }
      toast.success(text.created);
      onCreated(section, result.id ?? null);
      router.refresh();
    });
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="add-question-title"
      onCancel={(event) => {
        // The Esc key: let our own state close it (the window is removed from the page, which closes it).
        event.preventDefault();
        onClose();
      }}
      className="m-auto max-h-[92dvh] w-[min(94vw,36rem)] overflow-hidden rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-black/50"
    >
      <form onSubmit={create} noValidate className="flex max-h-[92dvh] flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <h2 id="add-question-title" className="text-lg font-bold text-brand-dark">
            {text.addTitle}
          </h2>
          <button type="button" onClick={onClose} aria-label={text.close} title={text.close} className={button.icon}>
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <label className="block">
            <span className="font-semibold text-ink">{text.label}</span>
            <input ref={firstField} lang="ta" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={150} className={inputClass()} />
          </label>

          <label className="block">
            <span className="font-semibold text-ink">{text.help_}</span>
            <input lang="ta" value={help} onChange={(e) => setHelp(e.target.value)} maxLength={300} className={inputClass()} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="font-semibold text-ink">{text.type}</span>
              <select value={type} onChange={(e) => setType(e.target.value as DirectoryFieldType)} className={`${inputClass()} select-arrow`}>
                {DIRECTORY_FIELD_TYPES.filter((t) => t !== "photo").map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABEL_EN[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-semibold text-ink">{text.section}</span>
              <select value={section} onChange={(e) => setSection(e.target.value)} className={`${inputClass()} select-arrow`}>
                {SECTIONS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.en}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isList && (
            <label className="block">
              <span className="font-semibold text-ink">{text.options}</span>
              <textarea lang="ta" value={options} onChange={(e) => setOptions(e.target.value)} rows={5} className={inputClass()} />
            </label>
          )}

          <div>
            <p className="font-semibold text-ink">{text.visibility}</p>
            <div className="mt-1.5">
              <VisibilityPicker value={visibility} onChange={setVisibility} label={text.visibility} />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <Switch checked={required} onChange={setRequired} label={text.required} />
            <span className="font-semibold text-ink">{text.required}</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line bg-panel/60 px-5 py-4 sm:px-6">
          {error && (
            <p role="alert" className="mr-auto text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          <button type="button" onClick={onClose} className={button.ghost}>
            {admin.common.cancel}
          </button>
          <button type="submit" disabled={pending} className={button.primary}>
            {pending ? text.creating : text.create}
          </button>
        </div>
      </form>
    </dialog>
  );
}
