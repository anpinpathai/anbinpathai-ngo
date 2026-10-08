"use client";

import { startTransition, useActionState, useEffect, useState, type FormEvent } from "react";
import { Field, describedBy, inputClass } from "@/components/admin/Field";
import { Icon } from "@/components/admin/Icon";
import { SaveBar } from "@/components/admin/SaveBar";
import { useUnsavedChanges } from "@/components/admin/UnsavedChanges";
import { card } from "@/components/admin/ui";
import { ProgrammeRow } from "@/components/radio/ProgrammeRow";
import { useToast } from "@/components/toast/ToastProvider";
import { admin } from "@/content/admin-en";
import { weekdaysShortTa } from "@/lib/radio-schedule-labels";
import type { ProgrammeFormValues } from "@/lib/radio-schedule-form";
import { nextDate, statusOf, toMinutes, type ProgrammeTiming } from "@/lib/radio-schedule-format";
import { saveProgrammeAction, type ProgrammeFormState } from "./actions";

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Monday first, as people in Sri Lanka count the week.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

// What the form holds so far, as something the preview can draw. Null until there is enough to draw.
function previewTiming(f: ProgrammeFormValues): ProgrammeTiming | null {
  if (!TIME.test(f.startTime)) return null;
  const endTime = TIME.test(f.endTime) && toMinutes(f.endTime) > toMinutes(f.startTime) ? f.endTime : null;
  if (f.kind === "once") {
    return DATE.test(f.date) ? { kind: "once", onDate: f.date, weekday: null, startTime: f.startTime, endTime } : null;
  }
  if (f.kind === "weekly" && f.weekday !== "") {
    return { kind: "weekly", onDate: null, weekday: Number(f.weekday), startTime: f.startTime, endTime };
  }
  return null;
}

export function ProgrammeForm({ initialValues, isEdit }: { initialValues: ProgrammeFormValues; isEdit: boolean }) {
  const initial: ProgrammeFormState = { status: "idle", values: initialValues, errors: {} };
  const [state, action, pending] = useActionState(saveProgrammeAction, initial);
  const { values, errors } = state;
  const text = admin.radioSchedule.form;

  // The fields are kept in state so the preview can follow what is being typed.
  const [kind, setKind] = useState(initialValues.kind);
  const [date, setDate] = useState(initialValues.date);
  const [weekday, setWeekday] = useState(initialValues.weekday);
  const [startTime, setStartTime] = useState(initialValues.startTime);
  const [endTime, setEndTime] = useState(initialValues.endTime);
  const [title, setTitle] = useState(initialValues.title);

  // Tell the person how the save went, in a toast.
  const toast = useToast();
  useEffect(() => {
    if (state.status === "saved") toast.success(state.message ?? text.saved);
    else if (state.status === "error") toast.error(state.message ?? admin.common.actionFailed);
  }, [state, toast, text.saved]);

  // "Edited" means something changed since the last result from the server.
  const [editedAt, setEditedAt] = useState<ProgrammeFormState | null>(null);
  const dirty = editedAt === state;
  useUnsavedChanges(dirty);
  const markEdited = () => setEditedAt(state);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  }

  const timing = previewTiming({ ...values, kind, date, weekday, startTime, endTime, title });
  const shownDate = timing ? (timing.kind === "weekly" ? nextDate(timing) : timing.onDate) : null;
  const alreadyOver = timing ? statusOf(timing) === "past" : false;

  const kinds = [
    { value: "once", icon: "calendar", label: text.once, help: text.onceHelp },
    { value: "weekly", icon: "rotateRight", label: text.weekly, help: text.weeklyHelp },
  ] as const;

  return (
    <form onSubmit={handleSubmit} onInput={markEdited} noValidate>
      <input type="hidden" name="id" value={values.id} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
        <fieldset className={`${card} min-w-0 space-y-6 p-5 sm:p-6`}>
          <legend className="sr-only">{text.detailsTitle}</legend>
          <h2 className="text-lg font-bold text-brand-dark" aria-hidden="true">
            {text.detailsTitle}
          </h2>

          <div>
            <p id="kind-question" className="font-semibold text-ink">
              {text.kindQuestion}
            </p>
            <div role="radiogroup" aria-labelledby="kind-question" className="mt-2 grid gap-3 sm:grid-cols-2">
              {kinds.map((k) => {
                const checked = kind === k.value;
                return (
                  <label
                    key={k.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3.5 transition-colors focus-within:ring-2 focus-within:ring-brand/30 ${
                      checked ? "border-brand bg-brand/5" : "border-line hover:bg-panel"
                    }`}
                  >
                    <input
                      type="radio"
                      name="kind"
                      value={k.value}
                      checked={checked}
                      onChange={() => setKind(k.value)}
                      className="sr-only"
                    />
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                        checked ? "bg-brand text-white" : "bg-panel text-muted"
                      }`}
                    >
                      <Icon name={k.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink">{k.label}</span>
                      <span className="block text-sm text-muted">{k.help}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.kind && (
              <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-red-700">
                <Icon name="alert" className="h-4 w-4" />
                {errors.kind}
              </p>
            )}
          </div>

          {kind === "once" ? (
            <Field id="date" label={text.date} error={errors.date}>
              <input
                id="date"
                name="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={describedBy("date", undefined, errors.date)}
                className={inputClass(errors.date)}
              />
            </Field>
          ) : (
            <div>
              <p id="weekday-question" className="font-semibold text-ink">
                {text.weekday}
              </p>
              <div
                role="radiogroup"
                aria-labelledby="weekday-question"
                className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7"
              >
                {WEEK_ORDER.map((day) => {
                  const checked = weekday === String(day);
                  return (
                    <label
                      key={day}
                      className={`flex cursor-pointer flex-col items-center rounded-xl border-2 px-1 py-2 text-center transition-colors focus-within:ring-2 focus-within:ring-brand/30 ${
                        checked ? "border-brand bg-brand text-white" : "border-line bg-white text-ink hover:bg-panel"
                      }`}
                    >
                      <input
                        type="radio"
                        name="weekday"
                        value={day}
                        checked={checked}
                        onChange={() => setWeekday(String(day))}
                        className="sr-only"
                      />
                      <span className="font-semibold leading-tight">{admin.radioSchedule.weekdaysShort[day]}</span>
                      <span lang="ta" className="text-xs leading-snug! opacity-80">
                        {weekdaysShortTa[day]}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.weekday && (
                <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-red-700">
                  <Icon name="alert" className="h-4 w-4" />
                  {errors.weekday}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="startTime" label={text.start} error={errors.startTime}>
              <input
                id="startTime"
                name="startTime"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                aria-invalid={Boolean(errors.startTime)}
                aria-describedby={describedBy("startTime", undefined, errors.startTime)}
                className={inputClass(errors.startTime)}
              />
            </Field>
            <Field id="endTime" label={text.end} error={errors.endTime}>
              <input
                id="endTime"
                name="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                aria-invalid={Boolean(errors.endTime)}
                aria-describedby={describedBy("endTime", undefined, errors.endTime)}
                className={inputClass(errors.endTime)}
              />
            </Field>
          </div>

          <Field id="title" label={text.title} help={text.titleHelp} error={errors.title}>
            <input
              id="title"
              name="title"
              type="text"
              lang="ta"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={describedBy("title", text.titleHelp, errors.title)}
              className={inputClass(errors.title)}
            />
          </Field>
        </fieldset>

        <aside className={`${card} min-w-0 p-5 sm:p-6 xl:sticky xl:top-6`} aria-labelledby="preview-title">
          <h2 id="preview-title" className="text-lg font-bold text-brand-dark">
            {text.previewTitle}
          </h2>
          <div lang="ta" className="mt-4">
            {timing && shownDate ? (
              <ProgrammeRow title={title.trim() || "…"} timing={timing} date={shownDate} />
            ) : (
              <p lang="en" className="rounded-xl border border-dashed border-line bg-panel/60 px-4 py-6 text-center text-muted">
                {text.previewEmpty}
              </p>
            )}
          </div>
          {alreadyOver && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
              <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
              {text.alreadyOver}
            </p>
          )}
          <p className="mt-3 text-sm text-muted">{text.timeNote}</p>
        </aside>
      </div>

      <SaveBar
        label={isEdit ? text.save : text.create}
        pendingLabel={admin.common.saving}
        pending={pending}
        cancelHref="/admin/radio-schedule"
        dirty={dirty}
      />
    </form>
  );
}
