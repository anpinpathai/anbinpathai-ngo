"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { ToastProvider } from "@/components/toast/ToastProvider";
import { admin } from "@/content/admin-en";
import { Icon, type IconName } from "./Icon";
import { UnsavedProvider, useConfirmLeave } from "./UnsavedChanges";

type NavItem = { href: string; label: string; icon: IconName; exact?: boolean };

const navGroups: { heading?: string; items: NavItem[] }[] = [
  { items: [{ href: "/admin", label: admin.nav.home, icon: "home", exact: true }] },
  {
    heading: admin.nav.content,
    items: [
      { href: "/admin/posts", label: admin.nav.posts, icon: "file" },
      { href: "/admin/team", label: admin.nav.team, icon: "users" },
    ],
  },
  {
    heading: admin.nav.website,
    items: [
      { href: "/admin/settings/home", label: admin.nav.homePage, icon: "layout" },
      { href: "/admin/settings/donation", label: admin.nav.donation, icon: "heart" },
      { href: "/admin/settings/contact", label: admin.nav.contact, icon: "phone" },
      { href: "/admin/settings/radio", label: admin.nav.radio, icon: "radio" },
      { href: "/admin/radio-schedule", label: admin.nav.radioSchedule, icon: "calendar" },
    ],
  },
];

function Logos({ size }: { size: string }) {
  return (
    <span className="flex shrink-0 items-center -space-x-2">
      {["/logos/logo-anbin.webp", "/logos/logo-mandram.webp"].map((src) => (
        <Image
          key={src}
          src={src}
          alt=""
          width={80}
          height={80}
          unoptimized
          className={`${size} rounded-full ring-2 ring-brand-dark`}
        />
      ))}
    </span>
  );
}

function SidebarContent({
  username,
  logoutAction,
  onNavigate,
}: {
  username: string;
  logoutAction: () => void | Promise<void>;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const confirmLeave = useConfirmLeave();

  // A menu link. If the page has unsaved changes, our own "Leave without saving?" window opens first.
  function go(event: MouseEvent<HTMLAnchorElement>, href: string) {
    // Opening in a new tab or window loses nothing, so let the browser do it.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (confirmLeave(() => {
      onNavigate?.();
      router.push(href);
    })) {
      onNavigate?.();
      return;
    }
    event.preventDefault();
  }

  const newPostActive = pathname === "/admin/posts/new";

  return (
    <div className="flex h-full flex-col text-white">
      <div className="flex items-center gap-3 px-5 pb-4 pt-5">
        <Logos size="h-10 w-10" />
        <div className="leading-tight">
          <p className="text-lg font-bold">{admin.title}</p>
          <p className="text-xs text-white/60">Anbin Paadhai</p>
        </div>
      </div>

      <div className="px-4">
        <Link
          href="/admin/posts/new"
          onClick={(event) => go(event, "/admin/posts/new")}
          aria-current={newPostActive ? "page" : undefined}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 font-bold text-ink shadow-sm transition-colors hover:bg-[#f0b90a]"
        >
          <Icon name="plus" className="h-5 w-5" />
          {admin.nav.newPost}
        </Link>
      </div>

      <nav aria-label={admin.title} className="mt-4 flex-1 space-y-4 overflow-y-auto px-3 pb-3">
        {navGroups.map((group, index) => (
          <div key={group.heading ?? index}>
            {group.heading && (
              <p className="mb-1.5 px-3 text-xs font-bold uppercase tracking-wider text-white/45">{group.heading}</p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={(event) => go(event, item.href)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 font-semibold transition-colors ${
                        active ? "bg-white text-brand-dark shadow-sm" : "text-white/85 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon name={item.icon} className={`h-5 w-5 ${active ? "text-brand" : "text-white/70"}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2 font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Icon name="globe" className="h-5 w-5 text-white/70" />
          {admin.nav.viewSite}
          <Icon name="externalLink" className="ml-auto h-4 w-4 text-white/50" />
        </Link>
        <Link
          href="/admin/help"
          onClick={(event) => go(event, "/admin/help")}
          aria-current={pathname === "/admin/help" ? "page" : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2 font-semibold transition-colors ${
            pathname === "/admin/help" ? "bg-white text-brand-dark shadow-sm" : "text-white/85 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon name="help" className={`h-5 w-5 ${pathname === "/admin/help" ? "text-brand" : "text-white/70"}`} />
          {admin.nav.help}
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Icon name="logout" className="h-5 w-5 text-white/70" />
            {admin.nav.logout}
          </button>
        </form>
        {username && (
          <p className="truncate px-3 pt-1 text-xs text-white/50">
            {admin.nav.signedInAs} <span className="font-semibold text-white/75">{username}</span>
          </p>
        )}
      </div>
    </div>
  );
}

function Shell({
  username,
  logoutAction,
  children,
}: {
  username: string;
  logoutAction: () => void | Promise<void>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="min-h-screen lg:pl-72">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 bg-brand-dark lg:block">
        <SidebarContent username={username} logoutAction={logoutAction} />
      </aside>

      <header className="sticky top-0 z-20 flex items-center gap-3 bg-brand-dark px-4 py-3 text-white shadow-md lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={admin.nav.menu}
          aria-expanded={open}
          className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 transition-colors hover:bg-white/20"
        >
          <Icon name="menu" className="h-6 w-6" />
        </button>
        <Logos size="h-9 w-9" />
        <span className="flex-1 truncate text-lg font-bold">{admin.title}</span>
        <Link
          href="/admin/posts/new"
          aria-label={admin.nav.newPost}
          className="flex items-center gap-1.5 rounded-xl bg-gold px-3.5 py-2.5 text-sm font-bold text-ink"
        >
          <Icon name="plus" className="h-5 w-5" />
          <span className="hidden min-[400px]:inline">{admin.nav.newPost}</span>
        </Link>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label={admin.nav.closeMenu}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/55"
          />
          <aside className="absolute inset-y-0 left-0 w-[19rem] max-w-[85vw] bg-brand-dark shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={admin.nav.closeMenu}
              className="absolute right-3 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <Icon name="x" className="h-5 w-5" />
            </button>
            <SidebarContent username={username} logoutAction={logoutAction} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}

export function AdminShell(props: { username: string; logoutAction: () => void | Promise<void>; children: ReactNode }) {
  return (
    <ToastProvider placement="top" closeLabel={admin.common.toastClose}>
      <UnsavedProvider>
        <Shell {...props} />
      </UnsavedProvider>
    </ToastProvider>
  );
}
