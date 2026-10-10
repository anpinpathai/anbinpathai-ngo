import Image from "next/image";
import { Button } from "@/components/Button";
import { t } from "@/content/ta-LK";

export function Hero({
  bannerUrl,
  tagline,
  headline,
  welcome,
}: {
  bannerUrl: string | null;
  tagline: string;
  headline: string;
  welcome: string;
}) {
  const { buttons } = t.home;

  return (
    <section className="relative isolate overflow-hidden bg-brand-dark text-white">
      {bannerUrl ? (
        <Image src={bannerUrl} alt="" fill priority unoptimized sizes="100vw" className="-z-20 object-cover" />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-br from-brand-dark via-brand to-[#4a1d8f]" />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-dark/90 via-brand-dark/70 to-brand-dark/45"
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="flex items-center gap-3">
          <Image
            src="/logos/logo-anbin.webp"
            alt=""
            width={256}
            height={256}
            unoptimized
            className="h-14 w-14 rounded-full ring-2 ring-white/70 sm:h-16 sm:w-16"
          />
          <Image
            src="/logos/logo-mandram.webp"
            alt=""
            width={256}
            height={256}
            unoptimized
            className="h-14 w-14 rounded-full ring-2 ring-white/70 sm:h-16 sm:w-16"
          />
        </div>

        <h1 className="mt-5 max-w-6xl text-[1.4rem] leading-snug text-white sm:text-3xl lg:text-4xl">
          {t.siteLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-4 inline-block rounded-full bg-gold px-4 py-1 text-base font-semibold text-ink sm:px-5 sm:text-lg">{tagline}</p>

        <p className="mt-6 max-w-3xl font-heading text-[1.3rem] font-bold leading-snug sm:text-3xl">“{headline}”</p>
        <p className="mt-3 max-w-2xl text-base text-white/90 sm:text-lg">{welcome}</p>

        <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
          <Button href={buttons.about.href} variant="light" className="w-full sm:w-auto">
            {buttons.about.label}
          </Button>
          <Button href={buttons.activities.href} variant="outlineLight" className="w-full sm:w-auto">
            {buttons.activities.label}
          </Button>
          <Button href={buttons.join.href} variant="donate" className="w-full sm:w-auto">
            {buttons.join.label}
          </Button>
        </div>
      </div>
    </section>
  );
}
