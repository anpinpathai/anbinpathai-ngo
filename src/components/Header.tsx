"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { donate, nav, radio, t, type NavItem } from "@/content/ta-LK";
import { categoryColor } from "@/lib/category-colors";
import { Button } from "./Button";
import { ColorStripe } from "./ColorStripe";
import { RadioIcon } from "./radio/icons";
import { SiteLogo } from "./SiteLogo";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Header({ showRadio = false }: { showRadio?: boolean }) {
  const pathname = usePathname();

  // The phone menu lists the radio just before "Contact". On wide screens there is no room for a sixth
  // word in the menu, so the radio is a round button beside Donate instead (see below).
  const mobileItems: readonly NavItem[] = showRadio
    ? [...nav.slice(0, -1), { label: radio.navLabel, href: radio.href }, ...nav.slice(-1)]
    : nav;
  const navRef = useRef<HTMLElement>(null);

  const [menu, setMenu] = useState<{ path: string; key: string | null }>({ path: pathname, key: null });
  const [mobile, setMobile] = useState<{ path: string; open: boolean }>({ path: pathname, open: false });

  const openKey = menu.path === pathname ? menu.key : null;
  const mobileOpen = mobile.path === pathname && mobile.open;

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenu((m) => ({ ...m, key: null }));
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenu((m) => ({ ...m, key: null }));
        setMobile((m) => ({ ...m, open: false }));
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (active: boolean) =>
    `inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-2 text-[0.94rem] font-semibold transition-colors hover:text-brand ${
      active ? "text-brand underline decoration-gold decoration-2 underline-offset-8" : "text-ink"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
      <ColorStripe />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 min-[360px]:gap-4 sm:px-6">
        <SiteLogo compact />

        <nav ref={navRef} aria-label={t.a11y.mainNav} className="hidden items-center xl:flex">
          {nav.map((item) =>
            item.children ? (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  aria-expanded={openKey === item.label}
                  aria-haspopup="true"
                  onClick={() =>
                    setMenu({ path: pathname, key: openKey === item.label ? null : item.label })
                  }
                  className={linkClass(item.children.some((c) => isActive(c.href)))}
                >
                  {item.label}
                  <Chevron open={openKey === item.label} />
                </button>
                {openKey === item.label && (
                  <ul className="absolute left-0 top-full z-50 mt-2 min-w-72 rounded-xl border border-line bg-white p-2 shadow-lg">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          aria-current={isActive(child.href) ? "page" : undefined}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-sand"
                        >
                          {child.colorKey && (
                            <span
                              aria-hidden="true"
                              className={`h-2.5 w-2.5 shrink-0 rounded-full ${categoryColor[child.colorKey].dot}`}
                            />
                          )}
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                aria-current={isActive(item.href!) ? "page" : undefined}
                className={linkClass(isActive(item.href!))}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          {showRadio && (
            <Link
              href={radio.href}
              aria-label={radio.name}
              title={radio.name}
              aria-current={isActive(radio.href) ? "page" : undefined}
              className={`hidden h-9 w-9 items-center justify-center rounded-full border-2 text-brand transition-colors hover:border-gold hover:bg-gold/25 xl:inline-flex ${
                isActive(radio.href) ? "border-gold bg-gold/25" : "border-brand/25"
              }`}
            >
              <RadioIcon className="h-5 w-5" />
            </Link>
          )}
          <Button href={donate.href} variant="donate" size="sm" className="max-[359px]:px-3">
            {donate.label}
          </Button>
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? t.a11y.closeMenu : t.a11y.openMenu}
            onClick={() => setMobile({ path: pathname, open: !mobileOpen })}
            className="grid h-11 w-11 place-items-center rounded-md border border-line text-brand xl:hidden"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label={t.a11y.mainNav}
          className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-line bg-cream px-4 pb-6 pt-2 xl:hidden"
        >
          <ul className="mx-auto max-w-7xl">
            {mobileItems.map((item) =>
              item.children ? (
                <li key={item.label} className="py-2">
                  <p className="px-3 text-sm font-semibold text-muted">{item.label}</p>
                  <ul>
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          aria-current={isActive(child.href) ? "page" : undefined}
                          className="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold text-ink hover:bg-sand"
                        >
                          {child.colorKey && (
                            <span
                              aria-hidden="true"
                              className={`h-2.5 w-2.5 shrink-0 rounded-full ${categoryColor[child.colorKey].dot}`}
                            />
                          )}
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href!}
                    aria-current={isActive(item.href!) ? "page" : undefined}
                    className="block rounded-md px-3 py-2.5 font-semibold text-ink hover:bg-sand"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
