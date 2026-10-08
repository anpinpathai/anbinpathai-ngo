import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { RadioIcon } from "@/components/radio/icons";
import { RadioPlayer } from "@/components/radio/RadioPlayer";
import { RadioSchedule } from "@/components/radio/RadioSchedule";
import { radio } from "@/content/ta-LK";
import { getRadioConfig } from "@/lib/radio";
import { listForSite } from "@/lib/radio-schedule";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: radio.name, description: radio.description };

// The page is saved between visits. Re-making it every 5 minutes lets finished programmes drop off
// and moves the "next" tag along, even when nobody has saved anything in the admin.
export const revalidate = 300;

export default async function RadioPage() {
  // Switched off, or no stream address yet: the page does not exist.
  if (!getRadioConfig(await getSettings())) notFound();
  const programmes = await listForSite();

  return (
    <main>
      <PageHeader
        title={radio.name}
        lead={<p>{radio.description}</p>}
        icon={
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand text-gold">
            <RadioIcon className="h-7 w-7" />
          </span>
        }
      />

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-brand to-[#4a1d8f] p-6 text-white shadow-lg sm:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-gold/25 blur-3xl" />
          <div className="relative">
            <RadioPlayer />
          </div>
        </section>

        <section>
          <h2 className="text-2xl text-brand">{radio.hearTitle}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {radio.hear.map((item) => (
              <li key={item} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/25 text-brand">
                  <RadioIcon />
                </span>
                <span className="text-lg font-semibold">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <RadioSchedule programmes={programmes} />

        <section className="rounded-2xl bg-sand p-6 sm:p-8">
          <h2 className="text-xl text-brand">{radio.howTitle}</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-6">
            {radio.how.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
