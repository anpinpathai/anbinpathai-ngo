import Link from "next/link";
import { Button } from "@/components/Button";
import { CategoryBadge } from "@/components/CategoryBadge";
import { categories, t } from "@/content/ta-LK";
import { categoryColor } from "@/lib/category-colors";

export default function Home() {
  const { home } = t;

  return (
    <main>
      <section className="bg-sand">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="font-semibold text-brand">{t.tagline}</p>
          <h1 className="mt-3 max-w-3xl text-3xl text-ink sm:text-5xl">{home.headline}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">{home.welcome}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={home.buttons.about.href}>{home.buttons.about.label}</Button>
            <Button href={home.buttons.activities.href} variant="outline">
              {home.buttons.activities.label}
            </Button>
            <Button href={home.buttons.join.href} variant="donate">
              {home.buttons.join.label}
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl text-brand sm:text-3xl">{home.sample.categoriesTitle}</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={c.href}
                className="flex h-full flex-col items-center gap-4 rounded-2xl border border-line bg-white p-6 text-center transition-shadow hover:shadow-lg"
              >
                <span
                  aria-hidden="true"
                  className={`grid h-20 w-20 place-items-center rounded-full font-heading text-3xl ${categoryColor[c.colorKey].solid}`}
                >
                  {c.name.charAt(0)}
                </span>
                <span className={`font-heading text-lg font-bold ${categoryColor[c.colorKey].text}`}>
                  {c.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <h2 className="text-2xl text-brand sm:text-3xl">{home.sample.title}</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <li
              key={c.slug}
              className={`overflow-hidden rounded-2xl border border-line border-t-4 bg-white ${categoryColor[c.colorKey].topBorder}`}
            >
              <div className="aspect-[4/3] bg-sand" aria-hidden="true" />
              <div className="p-5">
                <CategoryBadge name={c.name} colorKey={c.colorKey} />
                <h3 className="mt-3 text-lg text-ink">{home.sample.postTitle}</h3>
                <p className="mt-2 text-sm text-muted">{home.sample.postExcerpt}</p>
                <p className={`mt-3 text-sm font-semibold ${categoryColor[c.colorKey].text}`}>
                  {home.sample.readMore} →
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
