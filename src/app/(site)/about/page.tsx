import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/Button";
import { InitiativesGrid } from "@/components/home/InitiativesGrid";
import { PageHeader } from "@/components/PageHeader";
import { pages, t } from "@/content/ta-LK";

export const metadata: Metadata = { title: pages.about.title, description: t.footer.aboutText };

export default function AboutPage() {
  const { home } = t;
  const text = pages.about;

  return (
    <main>
      <PageHeader title={text.title} />

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-2xl text-brand sm:text-3xl">{home.aboutTitle}</h2>
          <p className="mt-4 text-lg leading-loose">{home.aboutText}</p>
        </div>
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-line">
          <div className="flex items-center justify-center gap-3">
            <Image
              src="/logos/logo-anbin.webp"
              alt=""
              width={256}
              height={256}
              unoptimized
              className="h-24 w-24 rounded-full sm:h-28 sm:w-28"
            />
            <Image
              src="/logos/logo-mandram.webp"
              alt=""
              width={256}
              height={256}
              unoptimized
              className="h-24 w-24 rounded-full sm:h-28 sm:w-28"
            />
          </div>
          <p className="mt-5 text-sm font-semibold text-muted">{home.aimLabel}</p>
          <p className="mt-1 font-heading text-2xl font-bold text-brand">“{text.aimQuote}”</p>
        </div>
      </section>

      <section className="bg-sand">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl text-brand sm:text-3xl">{text.goalsTitle}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {text.goals.map((goal) => (
              <li key={goal} className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm">
                <span
                  aria-hidden="true"
                  className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold text-ink"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="min-w-0 font-semibold [overflow-wrap:anywhere]">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl text-brand sm:text-3xl">{home.initiativesTitle}</h2>
        <div className="mt-8">
          <InitiativesGrid />
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/team">{text.teamButton}</Button>
          <Button href="/contact" variant="outline">
            {text.contactButton}
          </Button>
        </div>
      </section>
    </main>
  );
}
