import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/PageHeader";
import { pages, t } from "@/content/ta-LK";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: pages.contact.title, description: pages.contact.memberText };

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-semibold">{children}</dd>
    </div>
  );
}

const linkClass = "text-brand underline-offset-4 hover:underline";

export default async function ContactPage() {
  const s = await getSettings();
  const text = pages.contact;

  const phone = s.contact_phone?.trim();
  const email = s.contact_email?.trim();
  const address = s.contact_address?.trim();
  const facebook = s.facebook_url?.trim();
  const youtube = s.youtube_url?.trim();
  const hasDetails = Boolean(phone || email || address);

  return (
    <main>
      <PageHeader title={text.title} lead={<p>{text.intro}</p>} />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            {hasDetails ? (
              <dl className="divide-y divide-line">
                {phone && (
                  <Row label={text.phone}>
                    <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className={linkClass}>
                      {phone}
                    </a>
                  </Row>
                )}
                {email && (
                  <Row label={text.email}>
                    <a href={`mailto:${email}`} className={`${linkClass} break-all`}>
                      {email}
                    </a>
                  </Row>
                )}
                {address && (
                  <Row label={text.address}>
                    <span className="whitespace-pre-line">{address}</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.replace(/\n/g, ", "))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${linkClass} mt-2 block text-base`}
                    >
                      {text.map} →
                    </a>
                  </Row>
                )}
              </dl>
            ) : (
              <p className="text-muted">{text.soon}</p>
            )}

            {(facebook || youtube) && (
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-6">
                <span className="font-semibold">{text.followTitle}</span>
                {facebook && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border-2 border-brand px-4 py-1.5 text-sm font-semibold text-brand hover:bg-brand hover:text-white"
                  >
                    {t.footer.facebook}
                  </a>
                )}
                {youtube && (
                  <a
                    href={youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border-2 border-brand px-4 py-1.5 text-sm font-semibold text-brand hover:bg-brand hover:text-white"
                  >
                    {t.footer.youtube}
                  </a>
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-sand p-6 sm:p-8">
            <h2 className="text-xl text-brand">{text.memberTitle}</h2>
            <p className="mt-2">{text.memberText}</p>
          </section>
        </div>

        {facebook && (
          <aside className="mx-auto w-full max-w-[400px]">
            <iframe
              src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(facebook)}&tabs=timeline&width=400&height=560&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false`}
              title={t.footer.facebook}
              loading="lazy"
              scrolling="no"
              allow="encrypted-media; picture-in-picture; web-share"
              className="h-[560px] w-full overflow-hidden rounded-2xl border-0 bg-white"
            />
          </aside>
        )}
      </div>
    </main>
  );
}
