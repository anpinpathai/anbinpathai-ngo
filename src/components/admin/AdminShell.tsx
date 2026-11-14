"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { ToastProvider } from "@/components/toast/ToastProvider";
import { admin } from "@/content/admin-en";
import { directoryAdmin } from "@/content/admin-directory-en";
import { NAV_COOKIE, serializeNavPrefs, type NavPrefs } from "@/lib/admin-nav";
import { Icon, type IconName } from "./Icon";
import { UnsavedProvider, useConfirmLeave } from "./UnsavedChanges";

// exclude: other menu pages that live under this one, so only the right link is highlighted.
type NavItem = { href: string; label: string; icon: IconName; exact?: boolean; exclude?: string[] };
// A group with a heading opens and closes. The first group (just Home) has no heading and is always shown.
type NavGroup = { key: string; heading?: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  { key: "main", items: [{ href: "/admin", label: admin.nav.home, icon: "home", exact: true }] },
  {
    key: "content",
    heading: admin.nav.content,
    items: [
      { href: "/admin/posts", label: admin.nav.posts, icon: "file" },
      { href: "/admin/team", label: admin.nav.team, icon: "users" },
    ],
  },
  {
    key: "registry",
    heading: directoryAdmin.nav.group,
    items: [
      {
        href: "/admin/directory",
        label: directoryAdmin.nav.submissions,
        icon: "users",
        exclude: ["/admin/directory/fields", "/admin/directory/reviews"],
      },
      { href: "/admin/directory/fields", label: directoryAdmin.nav.fields, icon: "layout" },
      { href: "/admin/directory/reviews", label: directoryAdmin.nav.reviews, icon: "lock" },
      { href: "/admin/settings/directory", label: directoryAdmin.nav.words, icon: "globe" },
    ],
  },
  {
    key: "website",
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

function isActive(item: NavItem, pathname: string) {
  const within = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  return item.exact ? pathname === item.href : within(item.href) && !(item.exclude ?? []).some(within);
}

// The group that holds the page the admin is on (it opens by itself).
function activeGroupKey(pathname: string) {
  return navGroups.find((group) => group.heading && group.items.some((item) => isActive(item, pathname)))?.key;
}

// The two logos, side by side (they overlap a little), or one above the other in the shrunk menu.
function Logos({ size, stacked = false }: { size: string; stacked?: boolean }) {
  const logos = ["/logos/logo-anbin.webp", "/logos/logo-mandram.webp"];
  return (
    <span className={`flex shrink-0 items-center ${stacked ? "flex-col gap-1.5" : "-space-x-2"}`}>
      {logos.map((src) => (
        <Image key={src} src={src} alt="" width={80} height={80} unoptimized className={`${size} rounded-full ring-2 ring-brand-dark`} />
      ))}
    </span>
  );
}

function SidebarContent({
  username,
  logoutAction,
  onNavigate,
  compact,
  openGroups,
  onToggleGroup,
  onToggleCompact,
}: {
  username: string;
  logoutAction: () => void | Promise<void>;
  onNavigate?: () => void;
  // Shrunk to icons (the desktop menu only).
  compact: boolean;
  openGroups: Record<string, boolean>;
  onToggleGroup: (key: string) => void;
  // Only the desktop menu has the Collapse button.
  onToggleCompact?: () => void;
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
  const helpActive = pathname === "/admin/help";

  // One link of the menu: the icon and the words, or only the icon (with the words as a tooltip) when shrunk.
  const link = (href: string, label: string, icon: IconName, active: boolean) => (
    <Link
      href={href}
      onClick={(event) => go(event, href)}
      aria-current={active ? "page" : undefined}
      aria-label={compact ? label : undefined}
      title={compact ? label : undefined}
      className={`flex items-center rounded-xl font-semibold transition-colors ${
        compact ? "h-8 w-8 justify-center" : "gap-3 px-3 py-1.5"
      } ${active ? "bg-white text-brand-dark shadow-sm" : "text-white/85 hover:bg-white/10 hover:text-white"}`}
    >
      <Icon name={icon} className={`h-5 w-5 ${active ? "text-brand" : "text-white/70"}`} />
      {!compact && label}
    </Link>
  );

  // The small icon at the top edge of the menu that shrinks it to icons (and, when shrunk, opens it again). Only the
  // desktop menu has it.
  const toggle = onToggleCompact ? (
    <button
      type="button"
      onClick={onToggleCompact}
      aria-label={compact ? admin.nav.expandMenu : admin.nav.collapseMenu}
      title={compact ? admin.nav.expandMenu : admin.nav.collapseMenu}
      className={`grid shrink-0 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white ${compact ? "h-8 w-8" : "h-9 w-9"}`}
    >
      <Icon name={compact ? "chevronsRight" : "chevronsLeft"} className="h-5 w-5" />
    </button>
  ) : null;

  // The small buttons at the bottom (View website, Help, Log out): short rows when the menu is wide, one icon each when it
  // is shrunk. Log out is always the last one.
  const footerClass = (active = false) =>
    `flex items-center whitespace-nowrap rounded-lg font-semibold transition-colors ${
      compact ? "h-8 w-8 justify-center" : "gap-2 px-2.5 py-1.5 text-sm"
    } ${active ? "bg-white text-brand-dark shadow-sm" : "text-white/85 hover:bg-white/10 hover:text-white"}`;
  const footerIcon = (active = false) => `h-5 w-5 ${active ? "text-brand" : "text-white/70"}`;

  // A soft fade at the bottom of the list says "there is more below" (the scroll bar is hidden, so nothing else would).
  const listRef = useRef<HTMLElement>(null);
  const [moreBelow, setMoreBelow] = useState(false);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => setMoreBelow(list.scrollTop + list.clientHeight < list.scrollHeight - 4);
    list.addEventListener("scroll", update, { passive: true });
    // The list itself and every group in it: a group opening or closing changes the height of the content.
    const watcher = new ResizeObserver(update);
    watcher.observe(list);
    for (const child of Array.from(list.children)) watcher.observe(child);
    return () => {
      list.removeEventListener("scroll", update);
      watcher.disconnect();
    };
  }, [compact, openGroups]);

  return (
    <div className="flex h-full flex-col text-white">
      {compact ? (
        // Shrunk: both logos one above the other, then the icon that opens the menu again, then New post.
        <div className="flex flex-col items-center gap-2 px-2 pb-1 pt-3">
          <Logos size="h-7 w-7" stacked />
          {toggle}
          <Link
            href="/admin/posts/new"
            onClick={(event) => go(event, "/admin/posts/new")}
            aria-current={newPostActive ? "page" : undefined}
            aria-label={admin.nav.newPost}
            title={admin.nav.newPost}
            className="grid h-8 w-8 place-items-center rounded-xl bg-gold text-ink shadow-sm transition-colors hover:bg-[#f0b90a]"
          >
            <Icon name="plus" className="h-5 w-5" />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 px-5 pb-3 pt-4">
            <Logos size="h-10 w-10" />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-lg font-bold">{admin.title}</p>
              <p className="truncate text-xs text-white/60">Anbin Paadhai</p>
            </div>
            {toggle}
          </div>

          <div className="px-4">
            <Link
              href="/admin/posts/new"
              onClick={(event) => go(event, "/admin/posts/new")}
              aria-current={newPostActive ? "page" : undefined}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 font-bold text-ink shadow-sm transition-colors hover:bg-[#f0b90a]"
            >
              <Icon name="plus" className="h-5 w-5" />
              {admin.nav.newPost}
            </Link>
          </div>
        </>
      )}

      {/* The list never shows a scroll bar. It rarely needs one, because only one group is open at a time; on a very short
          screen it still scrolls with the wheel or a finger. */}
      <nav
        ref={listRef}
        aria-label={admin.title}
        style={
          moreBelow
            ? {
                maskImage: "linear-gradient(to bottom, #000 calc(100% - 2.25rem), transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, #000 calc(100% - 2.25rem), transparent)",
              }
            : undefined
        }
        className={`flex-1 overflow-y-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          compact ? "mt-2 flex flex-col items-center gap-0.5 px-2" : "mt-3 space-y-1.5 px-3 pb-3"
        }`}
      >
        {navGroups.map((group, index) => {
          const hasActive = group.items.some((item) => isActive(item, pathname));

          if (compact) {
            return (
              <div key={group.key} className={`flex flex-col items-center gap-0.5 ${index > 0 ? "mt-1 border-t border-white/10 pt-1.5" : ""}`}>
                {group.items.map((item) => (
                  <div key={item.href}>{link(item.href, item.label, item.icon, isActive(item, pathname))}</div>
                ))}
              </div>
            );
          }

          // A group without a heading (Home) is always shown. The others open and close.
          const open = !group.heading || openGroups[group.key] === true;
          return (
            <div key={group.key}>
              {group.heading && (
                <button
                  type="button"
                  onClick={() => onToggleGroup(group.key)}
                  aria-expanded={open}
                  aria-controls={`nav-group-${group.key}`}
                  title={open ? admin.nav.closeGroup : admin.nav.openGroup}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-bold uppercase tracking-wider text-white/50 transition-colors hover:bg-white/5 hover:text-white/80"
                >
                  <span className="flex-1">{group.heading}</span>
                  {/* A closed group that holds the page you are on shows a small gold dot. */}
                  {!open && hasActive && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold" />}
                  <Icon name="chevronDown" className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${open ? "" : "-rotate-90"}`} />
                </button>
              )}
              <div
                id={`nav-group-${group.key}`}
                inert={!open}
                className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              >
                <ul className="-m-1 min-h-0 space-y-1 overflow-hidden p-1">
                  {group.items.map((item) => (
                    <li key={item.href}>{link(item.href, item.label, item.icon, isActive(item, pathname))}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </nav>

      {/* The bottom of the menu: View website, Help, and, last of all, who is signed in and Log out. */}
      <div className={`border-t border-white/10 ${compact ? "flex flex-col items-center gap-0.5 px-2 py-2" : "px-3 py-2.5"}`}>
        <div className={compact ? "contents" : "space-y-1"}>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={compact ? admin.nav.viewSite : undefined}
            title={compact ? admin.nav.viewSite : undefined}
            className={`${footerClass()} ${compact ? "" : "w-full"}`}
          >
            <Icon name="globe" className={footerIcon()} />
            {!compact && admin.nav.viewSite}
          </Link>
          <Link
            href="/admin/help"
            onClick={(event) => go(event, "/admin/help")}
            aria-current={helpActive ? "page" : undefined}
            aria-label={compact ? admin.nav.help : undefined}
            title={compact ? admin.nav.help : undefined}
            className={`${footerClass(helpActive)} ${compact ? "" : "w-full"}`}
          >
            <Icon name="help" className={footerIcon(helpActive)} />
            {!compact && admin.nav.help}
          </Link>
        </div>

        <div className={compact ? "contents" : "mt-2 border-t border-white/10 pt-2"}>
          {!compact && username && (
            <p className="truncate px-2.5 pb-1 text-xs text-white/50">
              {admin.nav.signedInAs} <span className="font-semibold text-white/75">{username}</span>
            </p>
          )}
          <form action={logoutAction} className={compact ? "contents" : ""}>
            <button
              type="submit"
              aria-label={compact ? admin.nav.logout : undefined}
              title={compact ? `${admin.nav.logout}${username ? ` (${username})` : ""}` : undefined}
              className={`${footerClass()} ${compact ? "" : "w-full text-left"}`}
            >
              <Icon name="logout" className={footerIcon()} />
              {!compact && admin.nav.logout}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Shell({
  username,
  logoutAction,
  initialNav,
  children,
}: {
  username: string;
  logoutAction: () => void | Promise<void>;
  initialNav: NavPrefs;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // How the menu was left (remembered in a cookie, so the server draws it the same way). The group of the page you are
  // on is always open when you arrive.
  const [prefs, setPrefs] = useState<NavPrefs>(() => {
    const key = activeGroupKey(pathname);
    return key ? { ...initialNav, groups: { ...initialNav.groups, [key]: true } } : initialNav;
  });

  function remember(next: NavPrefs) {
    setPrefs(next);
    document.cookie = `${NAV_COOKIE}=${serializeNavPrefs(next)}; path=/admin; max-age=31536000; samesite=lax`;
  }

  // Going to a page in another group opens that group (the others stay as they were).
  const here = activeGroupKey(pathname);
  const [seen, setSeen] = useState(here);
  if (here !== seen) {
    setSeen(here);
    if (here && prefs.groups[here] !== true) setPrefs({ ...prefs, groups: { ...prefs.groups, [here]: true } });
  }

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

  const toggleGroup = (key: string) => remember({ ...prefs, groups: { ...prefs.groups, [key]: prefs.groups[key] !== true } });

  return (
    <div className={`min-h-screen transition-[padding] duration-200 motion-reduce:transition-none ${prefs.collapsed ? "lg:pl-[4.75rem]" : "lg:pl-72"}`}>
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden bg-brand-dark transition-[width] duration-200 motion-reduce:transition-none lg:block ${
          prefs.collapsed ? "w-[4.75rem]" : "w-72"
        }`}
      >
        <SidebarContent
          username={username}
          logoutAction={logoutAction}
          compact={prefs.collapsed}
          openGroups={prefs.groups}
          onToggleGroup={toggleGroup}
          onToggleCompact={() => remember({ ...prefs, collapsed: !prefs.collapsed })}
        />
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
            {/* On a phone the menu is always the full one, with the same groups that open and close. */}
            <SidebarContent
              username={username}
              logoutAction={logoutAction}
              onNavigate={() => setOpen(false)}
              compact={false}
              openGroups={prefs.groups}
              onToggleGroup={toggleGroup}
            />
          </aside>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}

export function AdminShell(props: { username: string; logoutAction: () => void | Promise<void>; initialNav: NavPrefs; children: ReactNode }) {
  return (
    <ToastProvider placement="top" closeLabel={admin.common.toastClose}>
      <UnsavedProvider>
        <Shell {...props} />
      </UnsavedProvider>
    </ToastProvider>
  );
}
