"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { button } from "@/components/admin/ui";
import { useToast } from "@/components/toast/ToastProvider";
import { FORM_TOKEN_FIELD, HONEYPOT_FIELD, LOCATION_KEYS, SECTIONS, type DirectoryFieldRow } from "@/lib/directory/config";
import type { EntryFormAction, EntryFormState } from "@/lib/directory/form-state";
import { fullWidthKeys } from "@/lib/directory/layout";
import { WIZARD_UI_EN, WIZARD_UI_TA, type FormUi } from "@/lib/directory/ui-text";
import { FieldControl } from "./FieldControl";
import { FieldShell } from "./FieldShell";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";
import { LocationBlock } from "./LocationBlock";

// What the admin's "Add a person" page changes in this form: English words, the admin's look, a Cancel link and the
// "Publish on the website now" tick on the last step instead of the visitor's consent box.
export type AdminSteps = {
  cancelHref: string;
  cancelLabel: string;
  publishLabel: string;
  submitLabel: string;
  sendingLabel: string;
};

// The step is kept in the address of the page (#step-2), because that is the one thing the browser and Next.js never
// rewrite behind our back. No address mark means the first step.
function stepOfAddress() {
  const found = /^#step-(\d+)$/.exec(window.location.hash);
  return found ? Number(found[1]) - 1 : 0;
}

// The page jumps at once and does not glide: the site scrolls smoothly by default, and a page that is still moving when
// the person reaches for a box (a dropdown, say) makes the click miss.
function jumpTo(element: HTMLElement | null | undefined, block: "start" | "center") {
  element?.scrollIntoView({ block, behavior: "instant" });
}

function focusField(form: HTMLFormElement | null, key: string) {
  const wrapper = form?.querySelector<HTMLElement>(`[data-field="${key}"]`);
  jumpTo(wrapper, "center");
  wrapper?.querySelector<HTMLElement>("input:not([type=hidden]), select, textarea, button")?.focus({ preventScroll: true });
}

// The registration form: the groups of questions one after the other, with the steps 1 - 2 - 3 ... at the top and a
// Next button at the bottom. Every step is in the page all the time (the others are only hidden), so "Send" posts all
// the answers together. Visitors (Tamil) and the admin's "Add a person" page (English, `admin` given) use this same form.
export function RegistrationForm({
  fields,
  initial,
  action,
  ui,
  uploadUrl,
  formToken,
  consent,
  admin,
  onEdited,
}: {
  fields: readonly DirectoryFieldRow[];
  initial: EntryFormState;
  action: EntryFormAction;
  ui: FormUi;
  uploadUrl: string;
  // The visitors' protection against robots and their consent box. The admin's page has neither.
  formToken?: string;
  consent?: string;
  admin?: AdminSteps;
  // Told whenever an answer is changed (the admin's page uses it for its "unsaved changes" warning).
  onEdited?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const toast = useToast();
  const isAdmin = admin !== undefined;
  const text = isAdmin ? WIZARD_UI_EN : WIZARD_UI_TA;

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
  // The furthest step reached so far. The steps up to it stay purple (and can be pressed) when the person goes back.
  const [furthest, setFurthest] = useState(0);
  const reached = Math.max(furthest, current);
  const formRef = useRef<HTMLFormElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const shownStep = useRef(current);

  // The step that holds a question ("consent" and anything unknown belong to the last step).
  const stepOf = (key: string) => {
    const index = groups.findIndex((group) => group.fields.some((f) => f.key === key));
    return index >= 0 ? index : last;
  };

  // Errors on the screen: the server's, plus the ones found here before going to the next step.
  const [errors, setErrors] = useState(state.errors);
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    setErrors(state.errors);
    // The server found something wrong: show the step that has the first problem.
    if (state.status === "error" && Object.keys(state.errors).length > 0) {
      setStep(Math.min(...Object.keys(state.errors).map(stepOf)));
    }
  }

  // Back button. Every step is a page of the browser's history, so the phone's Back button goes to the step before,
  // and only from the first step does it leave the form.
  useEffect(() => {
    const before = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    // A page that was reloaded in the middle starts again from the first step.
    if (stepOfAddress() > 0) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    function onPop() {
      const here = Math.max(0, Math.min(stepOfAddress(), last));
      setStep(here);
      setFurthest((f) => Math.max(f, here));
    }
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.history.scrollRestoration = before;
    };
  }, [last]);

  // After the server answered: say what went wrong, and show the first question that needs attention.
  useEffect(() => {
    if (state.status === "error") {
      toast.error(state.message ?? ui.fixErrors);
      const keys = Object.keys(state.errors);
      if (keys.length > 0) {
        const target = Math.min(...keys.map(stepOf));
        const at = stepOfAddress();
        if (target < at) window.history.go(target - at);
        const first = groups[target]?.fields.find((f) => state.errors[f.key]);
        pendingFocus.current = first?.key ?? keys[0];
      }
    } else if (state.status === "submitted") {
      // Go back to the first page of the history, so the Back button leaves the form after a registration.
      const at = stepOfAddress();
      if (at > 0) window.history.go(-at);
      jumpTo(cardRef.current, "start");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a new answer from the server should run this
  }, [state]);

  // After every step change (but not on the first show): bring the top of the form into view. When a question needs
  // attention, that question gets the focus instead of the heading, once the screen has been drawn.
  useEffect(() => {
    const key = pendingFocus.current;
    pendingFocus.current = null;
    if (shownStep.current !== current) {
      shownStep.current = current;
      jumpTo(cardRef.current, "start");
      if (!key) document.getElementById(`step-${groups[current]?.key}`)?.focus({ preventScroll: true });
    }
    if (key) focusField(formRef.current, key);
  });

  // Which questions on the screen still need an answer. A question that is not on the screen (for example the
  // district of someone who lives abroad) is not asked.
  function missingAnswers() {
    const form = formRef.current;
    const found: Record<string, string> = {};
    if (!form) return found;
    const data = new FormData(form);
    for (const group of groups) {
      for (const field of group.fields) {
        if (!form.querySelector(`[data-field="${field.key}"]`)) continue;
        // Someone living abroad always needs a country, whatever the admin chose.
        if (!field.required && field.key !== "country") continue;
        const empty =
          field.type === "multiselect"
            ? data.getAll(field.key).every((v) => String(v).trim() === "")
            : String(data.get(field.key) ?? "").trim() === "";
        if (empty) found[field.key] = field.key === "country" ? text.country : field.key === "district" ? text.district : text.needed;
      }
    }
    if (consent !== undefined && data.get("consent") !== "1") found.consent = ui.consentRequired;
    return found;
  }

  // Forward to a later step. The browser gets one page of history for every step passed, so the Back button goes
  // through them one by one.
  function advanceTo(target: number) {
    for (let i = current + 1; i <= target; i++) window.history.pushState(null, "", `#step-${i + 1}`);
    setStep(target);
    setFurthest((f) => Math.max(f, target));
  }

  function advance() {
    advanceTo(current + 1);
  }

  // Back to an earlier step (the Previous button, or a click on one of the numbers before this one).
  function goBackTo(target: number) {
    if (target >= current) return;
    if (stepOfAddress() === current) window.history.go(target - current);
    else setStep(target);
  }

  // Show what is missing, in the first step that has a problem (the form moves there if it is not the current one).
  function showProblems(found: Record<string, string>) {
    const target = Math.min(...Object.keys(found).map(stepOf));
    // Only that first step is marked; a later step is marked when the person gets there.
    const here = Object.fromEntries(Object.entries(found).filter(([key]) => stepOf(key) === target));
    setErrors((prev) => ({ ...prev, ...here }));
    pendingFocus.current = groups[target].fields.find((f) => here[f.key])?.key ?? Object.keys(here)[0];
    if (target < current) goBackTo(target);
    else if (target > current) advanceTo(target);
  }

  // A click on one of the numbers. Going back is always allowed. Going forward is allowed when every step from here up
  // to the one before the chosen number has its required answers; otherwise the first step with a missing answer is
  // shown, with the red message.
  function goToStep(target: number) {
    if (target === current) return;
    if (target < current) {
      goBackTo(target);
      return;
    }
    const found = Object.fromEntries(
      Object.entries(missingAnswers()).filter(([key]) => {
        const at = stepOf(key);
        return at >= current && at < target;
      }),
    );
    if (Object.keys(found).length > 0) showProblems(found);
    else advanceTo(target);
  }

  function next() {
    const found = Object.fromEntries(Object.entries(missingAnswers()).filter(([key]) => stepOf(key) === current));
    if (Object.keys(found).length > 0) showProblems(found);
    else advance();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (current < last) {
      next();
      return;
    }
    const found = missingAnswers();
    if (Object.keys(found).length > 0) {
      showProblems(found);
      return;
    }
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  // The Enter key in a one-line box goes to the next box (like the "next" key of a phone), and from the last box of a
  // step to the next step. It never sends the form by surprise.
  function onKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    const target = event.target;
    if (event.key !== "Enter" || event.nativeEvent.isComposing || !(target instanceof HTMLInputElement)) return;
    if (["checkbox", "radio", "file", "button", "submit", "hidden"].includes(target.type)) return;
    event.preventDefault();
    const boxes = [
      ...(target
        .closest("section")
        ?.querySelectorAll<HTMLElement>("input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), select, textarea") ?? []),
    ].filter((box) => !box.hasAttribute("disabled") && box.offsetParent !== null);
    const at = boxes.indexOf(target);
    if (at >= 0 && at < boxes.length - 1) boxes[at + 1].focus();
    else if (current < last) next();
    else formRef.current?.requestSubmit();
  }

  // An answer that is being corrected is no longer wrong.
  function onInput(event: FormEvent<HTMLFormElement>) {
    onEdited?.();
    const key = (event.target as HTMLElement).closest<HTMLElement>("[data-field]")?.dataset.field;
    if (key && errors[key]) {
      setErrors((prev) => {
        const rest = { ...prev };
        delete rest[key];
        return rest;
      });
    }
  }

  if (state.status === "submitted") {
    return (
      <div ref={cardRef} role="status" className="scroll-mt-28 rounded-3xl border border-line bg-white p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-3xl text-green-700">✓</span>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink">{state.message}</p>
      </div>
    );
  }

  if (groups.length === 0) return null;

  const buttonBase =
    "inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 disabled:opacity-60 sm:w-auto";

  return (
    <div ref={cardRef} className="min-w-0 scroll-mt-28 rounded-3xl border border-line bg-white p-4 shadow-sm min-[400px]:p-5 sm:p-8">
      {/* The steps: 1 - 2 - 3 ... The one you are on is gold. The steps already reached are purple. Any number can be
          pressed: backwards at once, forwards when the required answers in between are filled. */}
      <ol aria-label={text.progress} className="mb-8 flex items-center">
        {groups.map((group, index) => {
          const here = index === current;
          const visited = !here && index <= reached;
          return (
            <li key={group.key} className={`flex items-center ${index < last ? "flex-1" : ""}`}>
              <button
                type="button"
                onClick={() => goToStep(index)}
                aria-current={here ? "step" : undefined}
                aria-label={`${text.step} ${index + 1}: ${group.title}`}
                // The seven numbers must fit in one row on any phone, so they are a little smaller on a very narrow screen
                // (the sizes are worked out from the screen width: 7 numbers + 6 short lines between them). The invisible
                // "before" box makes each number taller to press, without making the row any wider.
                className={`relative grid h-[1.4rem] w-[1.4rem] shrink-0 place-items-center rounded-full text-sm font-bold transition-colors before:absolute before:inset-x-0 before:-inset-y-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold min-[350px]:h-[1.6rem] min-[350px]:w-[1.6rem] min-[375px]:h-[1.75rem] min-[375px]:w-[1.75rem] sm:h-10 sm:w-10 sm:text-lg ${
                  here
                    ? "cursor-default bg-gold text-ink ring-4 ring-brand/20"
                    : visited
                      ? "bg-brand text-white hover:bg-brand-dark"
                      : "border-2 border-line bg-white text-muted hover:border-brand hover:text-brand"
                }`}
              >
                {index + 1}
              </button>
              {index < last && <span aria-hidden="true" className={`mx-0.5 h-1 min-w-1 flex-1 rounded-full sm:mx-2.5 ${index < reached ? "bg-brand" : "bg-line"}`} />}
            </li>
          );
        })}
      </ol>

      <form ref={formRef} onSubmit={handleSubmit} onInput={onInput} onChange={onInput} onKeyDown={onKeyDown} noValidate lang={isAdmin ? "en" : "ta"}>
        {formToken !== undefined && (
          <>
            <input type="hidden" name={FORM_TOKEN_FIELD} value={formToken} />
            {/* A box only robots can see: a person never fills it in. */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
              <label>
                Fax
                <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
              </label>
            </div>
          </>
        )}

        {groups.map((group, index) => (
          <section key={group.key} hidden={index !== current} aria-labelledby={`step-${group.key}`}>
            <h2 id={`step-${group.key}`} tabIndex={-1} className="mb-6 scroll-mt-28 text-xl text-brand outline-none sm:text-2xl">
              {group.title}
            </h2>

            <div className="-mb-5 grid gap-x-5 sm:grid-cols-2">
              {group.key === "location" && byKey.has("residence") && (
                <LocationBlock fields={byKey} values={state.values} shares={state.shares} errors={errors} ui={ui} mode={isAdmin ? "admin" : "public"} />
              )}

              {group.rest.map((field) => (
                <FieldShell
                  key={field.key}
                  field={field}
                  id={`f-${field.key}`}
                  error={errors[field.key]}
                  ui={ui}
                  mode={isAdmin ? "admin" : "public"}
                  shared={state.shares[field.key] === true}
                  full={group.full.has(field.key)}
                >
                  <FieldControl
                    field={field}
                    value={state.values[field.key]}
                    error={errors[field.key]}
                    ui={ui}
                    uploadUrl={uploadUrl}
                    photoUrl={null}
                    onPhotoChange={onEdited}
                    roomy={isAdmin}
                  />
                </FieldShell>
              ))}
            </div>

            {index === last && admin && (
              <label className="mt-8 flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-sand/40 p-4 sm:p-5">
                <input type="checkbox" name="publish" value="1" className="h-5 w-5 shrink-0 accent-brand" />
                <span className="font-semibold text-ink">{admin.publishLabel}</span>
              </label>
            )}

            {index === last && consent !== undefined && (
              <div data-field="consent" className="mt-8 rounded-2xl border border-line bg-sand/40 p-4 sm:p-5">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" name="consent" value="1" aria-invalid={Boolean(errors.consent)} className="mt-1.5 h-5 w-5 shrink-0 accent-brand" />
                  <span className="text-[0.95rem] leading-relaxed text-ink">{consent}</span>
                </label>
                {errors.consent && (
                  <p role="alert" className="mt-2 text-sm font-semibold text-red-700">
                    {errors.consent}
                  </p>
                )}
              </div>
            )}
          </section>
        ))}

        {admin ? (
          // The admin's version: Cancel on the left, Previous and Next (or Add) on the right, in the admin's own button style.
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href={admin.cancelHref} className={`${button.ghost} max-sm:w-full`}>
              {admin.cancelLabel}
            </Link>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {current > 0 && (
                <button type="button" onClick={() => goBackTo(current - 1)} disabled={pending} className={`${button.secondary} max-sm:w-full`}>
                  <ArrowLeftIcon className="h-5 w-5" />
                  {text.previous}
                </button>
              )}
              {current < last ? (
                <button type="button" onClick={next} className={`${button.primary} max-sm:w-full`}>
                  {text.next}
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              ) : (
                <button type="submit" disabled={pending} className={`${button.primary} max-sm:w-full`}>
                  {pending ? admin.sendingLabel : admin.submitLabel}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {current > 0 && (
              <button
                type="button"
                onClick={() => goBackTo(current - 1)}
                disabled={pending}
                className={`${buttonBase} border-2 border-brand !py-3 font-semibold text-brand hover:bg-brand hover:text-white focus-visible:ring-gold`}
              >
                <ArrowLeftIcon className="h-5 w-5" />
                {text.previous}
              </button>
            )}
            {current < last ? (
              <button type="button" onClick={next} className={`${buttonBase} bg-gold text-ink hover:bg-ink hover:text-white focus-visible:ring-brand/40 sm:ml-auto`}>
                {text.next}
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            ) : (
              <button type="submit" disabled={pending} className={`${buttonBase} bg-gold text-ink hover:bg-ink hover:text-white focus-visible:ring-brand/40 sm:ml-auto`}>
                {pending ? text.sending : text.submit}
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
