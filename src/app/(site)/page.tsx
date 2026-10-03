import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Hero } from "@/components/home/Hero";
import { InitiativesGrid } from "@/components/home/InitiativesGrid";
import { RadioSection } from "@/components/home/RadioSection";
import { LatestUpdates } from "@/components/posts/LatestUpdates";
import { categories, donate, t } from "@/content/ta-LK";
import { categoryColor } from "@/lib/category-colors";
import { getLatestTabs } from "@/lib/public-posts";
import { getRadioConfig } from "@/lib/radio";
import { getSettings } from "@/lib/settings";
import { publicUrl } from "@/lib/storage";

export default async function Home() {
  const [s, latest] = await Promise.all([getSettings(), getLatestTabs(8)]);
  const { home } = t;

  const tabs = latest.map((tab) => ({
    ...tab,
    href: categories.find((c) => c.slug === tab.slug)?.href ?? "/",
  }));

  return (
    <main>
      <Hero
        bannerUrl={publicUrl(s.home_banner)}
        tagline={s.site_tagline?.trim() || t.tagline}
        headline={s.home_headline?.trim() || home.headline}
        welcome={s.home_welcome?.trim() || home.welcome}
      />

      {tabs.some((tab) => tab.posts.length > 0) && <LatestUpdates tabs={tabs} />}

      {getRadioConfig(s) && <RadioSection />}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl text-brand sm:text-3xl">{home.activitiesTitle}</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const color = categoryColor[c.colorKey];
            return (
              <li key={c.slug}>
                <Link
                  href={c.href}
                  className={`group flex h-full flex-col items-center rounded-2xl border border-line border-t-4 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg ${color.topBorder}`}
                >
                  <span className={`grid h-20 w-20 place-items-center rounded-full ${color.solid}`}>
                    <CategoryIcon slug={c.slug} className="h-10 w-10" />
                  </span>
                  <h3 className={`mt-4 text-lg ${color.text}`}>{c.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{home.blurbs[c.slug as keyof typeof home.blurbs]}</p>
                  <span className={`mt-4 text-sm font-semibold ${color.text}`}>{home.learnMore} →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-sand">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-2xl text-brand sm:text-3xl">{home.aboutTitle}</h2>
            <p className="mt-4 text-lg">{home.aboutText}</p>
            <div className="mt-6">
              <Button href={home.buttons.about.href}>{home.learnMore}</Button>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
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
            <p className="mt-1 font-heading text-2xl font-bold text-brand">{s.site_tagline?.trim() || t.tagline}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl text-brand sm:text-3xl">{home.initiativesTitle}</h2>
        <div className="mt-8">
          <InitiativesGrid />
        </div>
      </section>

      <section className="bg-brand-dark text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-12 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl text-white sm:text-3xl">{home.donate.title}</h2>
            <p className="mt-2 text-white/85">{home.donate.text}</p>
          </div>
          <Button href={donate.href} variant="donate">
            {home.donate.button}
          </Button>
        </div>
      </section>
    </main>
  );
}
