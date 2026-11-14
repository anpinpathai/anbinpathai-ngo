import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RegistrationForm } from "@/components/directory/RegistrationForm";
import { PageHeader } from "@/components/PageHeader";
import { directory } from "@/content/ta-LK";
import { listFields } from "@/lib/directory/fields";
import type { EntryFormState } from "@/lib/directory/form-state";
import { makeFormToken } from "@/lib/directory/spam";
import { directoryEnabled, directoryOpen, directoryTexts } from "@/lib/directory/text";
import { FORM_UI_TA } from "@/lib/directory/ui-text";
import { getSettings } from "@/lib/settings";
import { submitEntryAction } from "./actions";

// Made fresh for every visitor: the form carries a stamp that says when it was opened (a guard against robots).
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const text = directoryTexts(await getSettings());
  return { title: text.registerTitle, description: directory.lead };
}

export default async function RegisterPage() {
  const settings = await getSettings();
  if (!directoryEnabled(settings)) notFound();

  const text = directoryTexts(settings);
  const open = directoryOpen(settings);
  const fields = (await listFields()).filter((f) => f.onForm);
  const initial: EntryFormState = { status: "idle", values: {}, shares: {}, errors: {} };

  return (
    <main>
      <PageHeader compact title={text.registerTitle} crumb={text.registerTitle} lead={<p>{text.registerLead}</p>} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-12">
        {!open ? (
          <p className="mx-auto max-w-2xl rounded-3xl border border-dashed border-line bg-white/70 p-8 text-center text-lg text-ink sm:p-12">
            {text.closed}
          </p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start lg:gap-10">
            {/* From the "lg" width the two boxes are a side column that stays in view while the form scrolls, but only when
                the whole column fits on the screen (both boxes, not just the first). On a short screen it scrolls away with
                the page instead, so a part of it is never left hidden below the bottom edge.
                Below that the column dissolves ("contents") and the boxes line up around the form: the short privacy note,
                then the form, then the long "why join" box, so a phone reaches the form without scrolling past the reasons. */}
            <aside className="contents lg:order-2 lg:block lg:space-y-4 lg:[@media(min-height:720px)]:sticky lg:[@media(min-height:720px)]:top-24">
              <section className="order-3 mt-3 rounded-3xl bg-brand p-5 text-white shadow-sm sm:p-6 lg:mt-0">
                <h2 className="text-xl text-gold sm:text-2xl">{text.whyTitle}</h2>
                <ul className="mt-3 space-y-2.5">
                  {text.why.map((reason) => (
                    <li key={reason} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gold" />
                      <span className="leading-normal">{reason}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <p className="order-1 rounded-2xl border border-line bg-white p-4 text-sm leading-relaxed text-muted">
                <span aria-hidden="true">🔒 </span>
                {text.privacy}
              </p>
            </aside>

            <div className="order-2 min-w-0 lg:order-1">
              <RegistrationForm
                fields={fields}
                initial={initial}
                action={submitEntryAction}
                ui={FORM_UI_TA}
                uploadUrl="/api/directory/upload"
                formToken={makeFormToken()}
                consent={text.consent}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
