import Link from "next/link";
import { donate, nav, radio, t } from "@/content/ta-LK";
import { getRadioConfig } from "@/lib/radio";
import { getSettings } from "@/lib/settings";
import { ColorStripe } from "./ColorStripe";
import { SiteLogo } from "./SiteLogo";

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3.5 py-1 text-sm font-semibold text-white transition-colors hover:border-gold hover:text-gold"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        {children}
      </svg>
      {label}
    </a>
  );
}

function ContactIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="mt-0.5 h-4 w-4 shrink-0 text-gold"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export async function Footer() {
  const s = await getSettings();
  const phone = s.contact_phone?.trim();
  const email = s.contact_email?.trim();
  // The address is typed on several lines in Settings; in the footer it runs on one line.
  const address = s.contact_address
    ?.split(/\r?\n/)
    .map((line) => line.trim().replace(/[,\s]+$/, ""))
    .filter(Boolean)
    .join(", ");
  const facebook = s.facebook_url?.trim();
  const youtube = s.youtube_url?.trim();
  const hasContact = Boolean(phone || email || address);
  const hasSocial = Boolean(facebook || youtube);

  const links = nav.flatMap((item) =>
    item.children ? item.children : item.href ? [{ label: item.label, href: item.href }] : [],
  );
  if (getRadioConfig(s)) links.push({ label: radio.name, href: radio.href });
  links.push(donate);

  return (
    <footer className="mt-auto bg-brand-dark text-white">
      <ColorStripe />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* The links block has a fixed width and sits against the right edge on wide screens. */}
        <div className="grid items-start gap-x-8 gap-y-5 lg:grid-cols-[minmax(0,1fr)_30rem]">
          <div>
            <div className="flex lg:min-h-16 lg:items-center">
              <SiteLogo light />
            </div>
            <p className="mt-2 max-w-xl text-sm leading-normal text-white/90">{t.footer.aboutText}</p>
            <p className="mt-2 text-sm font-semibold leading-normal text-gold">{t.footer.since}</p>
          </div>

          <div>
            <h2 className="flex items-center text-base leading-snug text-white lg:min-h-16">{t.footer.linksTitle}</h2>
            {/* Columns (not a grid) so a long label that wraps never stretches a whole row. */}
            <ul className="mt-2 gap-x-8 text-sm leading-normal sm:columns-2">
              {links.map((l) => (
                <li key={l.href} className="break-inside-avoid pb-1.5">
                  <Link href={l.href} className="text-white/90 underline-offset-4 hover:text-gold hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* One horizontal line, styled like the copyright line below it. Hidden until Settings has details. */}
      {(hasContact || hasSocial) && (
        <div className="border-t border-white/15">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-white/80 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
            {hasContact && (
              <ul className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-1.5">
                {phone && (
                  <li className="flex items-start gap-2">
                    <ContactIcon>
                      <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </ContactIcon>
                    <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="hover:text-gold">
                      {phone}
                    </a>
                  </li>
                )}
                {email && (
                  <li className="flex items-start gap-2">
                    <ContactIcon>
                      <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                    </ContactIcon>
                    <a href={`mailto:${email}`} className="[overflow-wrap:anywhere] hover:text-gold">
                      {email}
                    </a>
                  </li>
                )}
                {address && (
                  <li className="flex items-start gap-2">
                    <ContactIcon>
                      <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </ContactIcon>
                    <span className="[overflow-wrap:anywhere]">{address}</span>
                  </li>
                )}
              </ul>
            )}
            {hasSocial && (
              <div className="flex flex-wrap gap-2.5 xl:shrink-0">
                {facebook && (
                  <SocialLink href={facebook} label={t.footer.facebook}>
                    <path d="M12 2a10 10 0 1 0 1.5 19.9v-7h-2.3V12h2.3V9.8c0-2.3 1.4-3.5 3.4-3.5.7 0 1.4.1 2 .2v2.3h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.6l-.4 2.9h-2.2v7A10 10 0 0 0 12 2Z" />
                  </SocialLink>
                )}
                {youtube && (
                  <SocialLink href={youtube} label={t.footer.youtube}>
                    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
                  </SocialLink>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-white/15">
        <p className="mx-auto max-w-7xl px-4 py-4 text-sm text-white/75 sm:px-6">
          © {new Date().getFullYear()} {t.siteName}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
