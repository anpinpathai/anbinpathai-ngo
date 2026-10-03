import Link from "next/link";
import { donate, nav, t } from "@/content/ta-LK";
import { getSettings } from "@/lib/settings";
import { ColorStripe } from "./ColorStripe";
import { SiteLogo } from "./SiteLogo";

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:border-gold hover:text-gold"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        {children}
      </svg>
      {label}
    </a>
  );
}

export async function Footer() {
  const s = await getSettings();
  const phone = s.contact_phone?.trim();
  const email = s.contact_email?.trim();
  const address = s.contact_address?.trim();
  const facebook = s.facebook_url?.trim();
  const youtube = s.youtube_url?.trim();
  const hasContact = Boolean(phone || email || address);
  const hasSocial = Boolean(facebook || youtube);

  const links = nav.flatMap((item) =>
    item.children ? item.children : item.href ? [{ label: item.label, href: item.href }] : [],
  );
  links.push(donate);

  return (
    <footer className="mt-auto bg-brand-dark text-white">
      <ColorStripe />
      <div
        className={`mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 ${
          hasContact || hasSocial ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        <div>
          <SiteLogo light />
          <p className="mt-5 max-w-md text-white/85">{t.footer.aboutText}</p>
          <p className="mt-3 font-semibold text-gold">{t.footer.since}</p>
        </div>

        <div>
          <h2 className="text-lg text-white">{t.footer.linksTitle}</h2>
          <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/85 underline-offset-4 hover:text-gold hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {(hasContact || hasSocial) && (
          <div>
            {hasContact && (
              <>
                <h2 className="text-lg text-white">{t.footer.contactTitle}</h2>
                <ul className="mt-4 space-y-2 text-white/85">
                  {phone && (
                    <li>
                      <a href={`tel:${phone.replace(/[^0-9+]/g, "")}`} className="hover:text-gold">
                        {phone}
                      </a>
                    </li>
                  )}
                  {email && (
                    <li>
                      <a href={`mailto:${email}`} className="break-all hover:text-gold">
                        {email}
                      </a>
                    </li>
                  )}
                  {address && <li className="whitespace-pre-line">{address}</li>}
                </ul>
              </>
            )}
            {hasSocial && (
              <>
                <h2 className={`text-lg text-white ${hasContact ? "mt-8" : ""}`}>{t.footer.followTitle}</h2>
                <div className="mt-4 flex flex-wrap gap-3">
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
              </>
            )}
          </div>
        )}
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-7xl px-4 py-4 text-sm text-white/75 sm:px-6">
          © {new Date().getFullYear()} {t.siteName}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
