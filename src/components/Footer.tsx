import Link from "next/link";
import { donate, nav, t } from "@/content/ta-LK";
import { ColorStripe } from "./ColorStripe";
import { SiteLogo } from "./SiteLogo";

export function Footer() {
  const links = nav.flatMap((item) =>
    item.children ? item.children : item.href ? [{ label: item.label, href: item.href }] : [],
  );
  links.push(donate);

  return (
    <footer className="mt-auto bg-brand-dark text-white">
      <ColorStripe />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2">
        <div>
          <SiteLogo light />
          <p className="mt-5 max-w-md text-white/85">{t.footer.aboutText}</p>
          <p className="mt-3 font-semibold text-gold">{t.footer.since}</p>
        </div>
        <div>
          <h2 className="text-lg text-white">{t.footer.linksTitle}</h2>
          <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/85 underline-offset-4 hover:text-gold hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-7xl px-4 py-4 text-sm text-white/75 sm:px-6">
          © {new Date().getFullYear()} {t.siteName}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
