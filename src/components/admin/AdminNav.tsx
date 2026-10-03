"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { admin } from "@/content/admin-en";

const links = [
  { href: "/admin", label: admin.nav.dashboard },
  { href: "/admin/settings", label: admin.nav.settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label={admin.title} className="flex flex-wrap items-center gap-1">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 font-semibold transition-colors ${
              active ? "bg-white/15 text-gold" : "text-white/90 hover:bg-white/10"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
