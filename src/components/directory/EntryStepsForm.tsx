"use client";

import { startTransition, useActionState, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { button } from "@/components/admin/ui";
import { useUnsavedChanges } from "@/components/admin/UnsavedChanges";
import { useToast } from "@/components/toast/ToastProvider";
import { LOCATION_KEYS, SECTIONS, type DirectoryFieldRow } from "@/lib/directory/config";
import type { EntryFormAction, EntryFormState } from "@/lib/directory/form-state";
import { fullWidthKeys } from "@/lib/directory/layout";
import type { FormUi } from "@/lib/directory/ui-text";
import { FieldControl } from "./FieldControl";
import { FieldShell } from "./FieldShell";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";
import { LocationBlock } from "./LocationBlock";

export type StepsContext = { pending: boolean; dirty: boolean };

// The words around the steps (the form's own questions come from the registry settings).
export type StepsLabels = {
  steps: string;
  // "Step", shown as "Step 2 / 7".
  step: string;
  previous: string;
  next: string;
  // Said for a step that has a mistake in it.
  problem: string;
};

// One person's answers as steps 1 - 2 - 3 ... The look is the one of the "Add a person" page, but the person who edits
// can go to any step at once (nothing has to be filled in order), and Save is always in reach. All the steps are in the
// page all the time (the others are only hidden), so Save sends every answer together. Used by the admin's page of one
// person (English) and by reviewers (Tamil).
export function EntryStepsForm({
  fields,
  initial,
  action,
  mode,
  ui,
  uploadUrl,
  photoUrl,
  hidden = {},
  labels,
  actions,
}: {
  fields: readonly DirectoryFieldRow[];
  initial: EntryFormState;
  action: EntryFormAction;
  mode: "admin" | "reviewer";
  ui: FormUi;
  uploadUrl: string | null;
  photoUrl: string | null;
  hidden?: Record<string, string>;
  labels: StepsLabels;
  actions: (context: StepsContext) => ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const toast = useToast();
  const isAdmin = mode === "admin";

  const byKey = useMemo(() => new Map(fields.map((f) => [f.key, f])), [fields]);
  // The groups that have at least one question: these are the steps.
  const groups = useMemo(
    () =>
      SECTIONS.map((section) => {
        const all = fields.filter((f) => f.section === section.key);
        const rest = all.filter((f) => !(LOCATION_KEYS as readonly string[]).includes(f.key));
        return { key: section.key, title: isAdmin ? section.en : section.ta, fields: all, rest, full: fullWidthKeys(rest) };
      }).filter((group) => group.fields.length > 0),
    [fields, isAdmin],
  );
  const last = groups.length - 1;

  const [step, setStep] = useState(0);
  const current = Math.min(step, Math.max(last, 0));
  const cardRef = useRef<HTMLDivElement>(null);
  const shownStep = useRef(current);

  const stepOf = (key: string) => Math.max(
    0,
    groups.findIndex((group) => group.fields.some((f) => f.key === key)),
  );

  // The mistakes on the screen: the ones the server found, until the person corrects that answer.
  const [errors, setErrors] = useState(state.errors);
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    setErrors(state.errors);
    // The server found something wrong: show the first step that has a problem.
    if (state.status === "error" && Object.keys(state.errors).length > 0) {
      setStep(Math.min(...Object.keys(state.errors).map(stepOf)));
    }
  }

  // After the server answered: a message, and the first mistake gets the cursor (its step is already shown by now).
  useEffect(() => {
    if (state.status === "saved") toast.success(state.message ?? "");
    else if (state.status === "error") {
      toast.error(state.message ?? ui.fixErrors);
      const first = groups.flatMap((g) => g.fields).find((f) => state.errors[f.key])?.key ?? Object.keys(state.errors)[0];
      const target = first ? document.querySelector<HTMLElement>(`[data-field="${first}"]`) : null;
      target?.scrollIntoView({ block: "center", behavior: "instant" });
      target?.querySelector<HTMLElement>("input, select, textarea, button")?.focus({ preventScroll: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a new answer from the server should run this
  }, [state]);

  // After going to another step: bring the top of the form into view (the page jumps, it does not glide, so a click
  // on the next box cannot land on a page that is still moving).
  useEffect(() => {
    if (shownStep.current === current) return;
    shownStep.current = current;
    cardRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [current]);

  // "Edited" means something changed since the last answer from the server.
  const [editedAt, setEditedAt] = useState<EntryFormState | null>(null);
  const dirty = editedAt === state;
  useUnsavedChanges(isAdmin && dirty);

  function onInput(event: FormEvent<HTMLFormElement>) {
    setEditedAt(state);
    // An answer that is being corrected is no longer wrong.
    const key = (event.target as HTMLElement).closest<HTMLElement>("[data-field]")?.dataset.field;
    if (key && errors[key]) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest[key];
        return rest;
      });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  if (groups.length === 0) return null;

  return (
    <form onSubmit={handleSubmit} onInput={onInput} onChange={onInput} noValidate lang={isAdmin ? "en" : "ta"}>
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <div ref={cardRef} className={`scroll-mt-20 rounded-2xl border border-line/80 bg-white p-3.5 shadow-sm min-[400px]:p-4 sm:p-7 ${isAdmin ? "" : "sm:rounded-3xl"}`}>
        {/* The steps: 1 - 2 - 3 ... Any number can be pressed. The one you are on is gold, a step with a mistake is red. */}
        <ol aria-label={labels.steps} className="mb-7 flex items-center">
          {groups.map((group, index) => {
            const here = index === current;
            const bad = group.fields.some((f) => errors[f.key]);
            return (
              <li key={group.key} className={`flex items-center ${index < last ? "flex-1" : ""}`}>
                <button
                  type="button"
                  onClick={() => setStep(index)}
                  aria-current={here ? "step" : undefined}
                  aria-label={`${labels.step} ${index + 1}: ${group.title}${bad ? `. ${labels.problem}` : ""}`}
                  title={group.title}
                  // The numbers must fit in one row on any phone (this form can sit inside two other boxes), so they grow with the
                  // screen width. The invisible "before" box makes each number taller to press, without making the row wider.
                  className={`relative grid h-[1.4rem] w-[1.4rem] shrink-0 place-items-center rounded-full text-sm font-bold transition-colors before:absolute before:inset-x-0 before:-inset-y-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold min-[350px]:h-[1.6rem] min-[350px]:w-[1.6rem] min-[375px]:h-[1.75rem] min-[375px]:w-[1.75rem] min-[400px]:h-[1.9rem] min-[400px]:w-[1.9rem] sm:h-10 sm:w-10 sm:text-lg ${
                    bad
                      ? `bg-red-600 text-white hover:bg-red-700 ${here ? "ring-4 ring-red-200" : ""}`
                      : here
                        ? "cursor-default bg-gold text-ink ring-4 ring-brand/20"
                        : "bg-brand text-white hover:bg-brand-dark"
                  }`}
                >
                  {index + 1}
                </button>
                {index < last && <span aria-hidden="true" className="mx-px h-1 min-w-0.5 flex-1 rounded-full bg-brand/70 sm:mx-2.5 sm:min-w-1" />}
              </li>
            );
          })}
        </ol>

        {groups.map((group, index) => (
          <section key={group.key} hidden={index !== current} aria-labelledby={`step-${group.key}`}>
            <p className="text-sm font-semibold text-muted">
              {labels.step} {index + 1} / {groups.length}
            </p>
            <h2 id={`step-${group.key}`} className={`mb-6 mt-0.5 ${isAdmin ? "text-xl font-bold text-brand-dark sm:text-2xl" : "text-xl text-brand sm:text-2xl"}`}>
              {group.title}
            </h2>

            <div className="-mb-5 grid gap-x-5 sm:grid-cols-2">
              {group.key === "location" && byKey.has("residence") && (
                <LocationBlock fields={byKey} values={state.values} shares={state.shares} errors={errors} ui={ui} mode={mode} />
              )}

              {group.rest.map((field) => (
                <FieldShell
                  key={field.key}
                  field={field}
                  id={`f-${field.key}`}
                  error={errors[field.key]}
                  ui={ui}
                  mode={mode}
                  shared={state.shares[field.key] === true}
                  full={group.full.has(field.key)}
                >
                  <FieldControl
                    field={field}
                    value={state.values[field.key]}
                    error={errors[field.key]}
                    ui={ui}
                    uploadUrl={uploadUrl}
                    photoUrl={photoUrl}
                    onPhotoChange={() => setEditedAt(state)}
                    roomy={isAdmin}
                  />
                </FieldShell>
              ))}
            </div>
          </section>
        ))}

        {/* Only moves between the steps. Saving is in the bar below, which stays in view. */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line/70 pt-5">
          {/* On a phone the two buttons share the row, so they never push the page wider than the screen. */}
          <button
            type="button"
            onClick={() => setStep(current - 1)}
            disabled={current === 0}
            className={`${button.secondary} !px-3 max-sm:min-w-0 max-sm:flex-1 max-sm:!text-sm sm:!px-4`}
          >
            <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            {labels.previous}
          </button>
          <button
            type="button"
            onClick={() => setStep(current + 1)}
            disabled={current === last}
            className={`${button.secondary} !px-3 max-sm:min-w-0 max-sm:flex-1 max-sm:!text-sm sm:!px-4`}
          >
            {labels.next}
            <ArrowRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      {actions({ pending, dirty })}
    </form>
  );
}
