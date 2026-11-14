import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeftIcon, PinIcon } from "@/components/directory/icons";
import { Avatar } from "@/components/directory/PersonCard";
import { directory, postText } from "@/content/ta-LK";
import { isValidCode } from "@/lib/directory/config";
import { listFields } from "@/lib/directory/fields";
import { getPublicProfile, type PublicItem } from "@/lib/directory/public";
import { directoryEnabled, directoryTexts } from "@/lib/directory/text";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const load = cache(async (code: string) => {
  if (!isValidCode(code)) return null;
  return getPublicProfile(code, await listFields());
});

export async function generateMetadata(props: PageProps<"/directory/[code]">): Promise<Metadata> {
  const profile = await load((await props.params).code);
  if (!profile) return {};
  return {
    title: profile.name,
    description: [profile.place, profile.artFields.join(", ")].filter(Boolean).join(" · ") || directory.lead,
  };
}

function Item({ item }: { item: PublicItem }) {
  const link = "break-all font-semibold text-brand underline underline-offset-4";
  return (
    <div className="grid gap-0.5 border-t border-line/70 py-3 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[10.5rem_minmax(0,1fr)] sm:gap-5">
      <dt className="text-[0.9rem] font-semibold text-muted">{item.label}</dt>
      <dd className="min-w-0 text-ink [overflow-wrap:anywhere]">
        {item.kind === "text" && <p className="whitespace-pre-line leading-relaxed">{item.value}</p>}
        {item.kind === "list" && (
          <ul className="flex flex-wrap gap-1.5">
            {item.value.map((v) => (
              <li key={v} className="rounded-full bg-sand px-2.5 py-0.5 text-[0.85rem] font-semibold text-brand">
                {v}
              </li>
            ))}
          </ul>
        )}
        {item.kind === "link" && (
          <a href={item.value} target="_blank" rel="noopener noreferrer nofollow" className={link}>
            {item.value}
          </a>
        )}
        {item.kind === "links" && (
          <ul className="space-y-1.5">
            {item.value.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer nofollow" className={link}>
                  {url}
                </a>
              </li>
            ))}
          </ul>
        )}
      </dd>
    </div>
  );
}

export default async function ProfilePage(props: PageProps<"/directory/[code]">) {
  const settings = await getSettings();
  if (!directoryEnabled(settings)) notFound();

  const profile = await load((await props.params).code);
  if (!profile) notFound();

  const text = directoryTexts(settings);
  const ui = directory.ui;

  return (
    <main>
      <section className="bg-sand">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-7">
          <nav aria-label={postText.home} className="text-sm text-muted">
            <Link href="/" className="-my-1.5 inline-block py-1.5 underline-offset-4 hover:underline">
              {postText.home}
            </Link>
            <span aria-hidden="true"> › </span>
            <Link href={directory.href} className="-my-1.5 inline-block py-1.5 underline-offset-4 hover:underline">
              {text.title}
            </Link>
            <span aria-hidden="true"> › </span>
            <span>{profile.name}</span>
          </nav>

          {/* The photo and the words side by side on every screen, so the top of the page stays short, also on a phone. */}
          <div className="mt-4 flex items-center gap-4 sm:gap-6">
            <Avatar name={profile.name} photoUrl={profile.photoUrl} size="h-20 w-20 sm:h-28 sm:w-28" text="text-3xl sm:text-4xl" border="border-[3px]" />
            <div className="min-w-0">
              <h1 className="text-xl leading-snug text-brand [overflow-wrap:anywhere] sm:text-3xl">{profile.name}</h1>
              {profile.place && (
                <p className="mt-1 flex items-start gap-1.5 text-[0.95rem] leading-snug text-ink sm:text-base">
                  <PinIcon className="mt-[0.2rem] h-4 w-4 shrink-0 text-brand/70" />
                  <span>{profile.place}</span>
                </p>
              )}
              {profile.artFields.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {profile.artFields.map((f) => (
                    <li key={f} className="rounded-full bg-white px-2.5 py-0.5 text-[0.8rem] font-semibold text-brand">
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-[0.85rem] text-muted">
                {ui.registryNumber}: <span className="font-semibold">{profile.code}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-7">
        {profile.items.length > 0 && (
          <section aria-labelledby="details" className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
            <h2 id="details" className="sr-only">
              {ui.detailsTitle}
            </h2>
            <dl>
              {profile.items.map((item) => (
                <Item key={item.key} item={item} />
              ))}
            </dl>
          </section>
        )}

        <p className="mt-5">
          <Link
            href={directory.href}
            className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-brand px-4 text-[0.95rem] font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {ui.back}
          </Link>
        </p>
      </div>
    </main>
  );
}
