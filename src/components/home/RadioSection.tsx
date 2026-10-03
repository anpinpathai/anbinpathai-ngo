import Link from "next/link";
import { radio } from "@/content/ta-LK";
import { RadioPlayer } from "@/components/radio/RadioPlayer";

// The radio on the Home page: a rounded purple card sitting on the cream page, so it stands apart
// from the full-width banner above it. Only shown when the radio is set up in Settings.
export function RadioSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-brand to-[#4a1d8f] text-white shadow-xl ring-1 ring-brand-dark/10">
        {/* Faint radio waves and a gold glow behind the content */}
        <svg
          aria-hidden="true"
          viewBox="0 0 520 520"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="pointer-events-none absolute -right-32 top-1/2 -z-10 h-[32rem] w-[32rem] -translate-y-1/2 text-white/10"
        >
          <circle cx="260" cy="260" r="60" />
          <circle cx="260" cy="260" r="120" />
          <circle cx="260" cy="260" r="180" />
          <circle cx="260" cy="260" r="240" />
        </svg>
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 -z-10 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />

        <div className="grid items-center gap-8 px-6 py-10 sm:px-10 md:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2.5 rounded-full bg-gold px-4 py-0.5 text-sm font-semibold text-ink">
              <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
              </span>
              {radio.live}
            </p>
            <h2 className="mt-4 text-2xl text-white sm:text-3xl">{radio.name}</h2>
            <p className="mt-3 max-w-xl text-lg text-white/90">{radio.description}</p>
            <Link
              href={radio.href}
              className="mt-5 inline-block font-semibold text-gold underline-offset-4 hover:underline"
            >
              {radio.openPage} →
            </Link>
          </div>
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 sm:p-6">
            <RadioPlayer />
          </div>
        </div>
      </div>
    </section>
  );
}
