// How the admin menu was left: which groups are open, and whether the whole menu is shrunk to icons. It is remembered in a
// small cookie (it holds no secret), so the page is drawn the right way on the server, with no flicker. Safe to use in
// the browser and on the server.

export const NAV_COOKIE = "admin_nav";

export type NavPrefs = {
  // The menu is shrunk to icons (desktop only).
  collapsed: boolean;
  // The groups the admin opened (true) or closed (false). A group that was never touched is not here.
  groups: Record<string, boolean>;
};

export const DEFAULT_NAV: NavPrefs = { collapsed: false, groups: {} };

export function parseNavPrefs(raw: string | undefined | null): NavPrefs {
  if (!raw) return DEFAULT_NAV;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    try {
      data = JSON.parse(decodeURIComponent(raw));
    } catch {
      return DEFAULT_NAV;
    }
  }
  if (typeof data !== "object" || data === null) return DEFAULT_NAV;

  const { c, g } = data as { c?: unknown; g?: unknown };
  const groups: Record<string, boolean> = {};
  if (typeof g === "object" && g !== null) {
    for (const [key, value] of Object.entries(g).slice(0, 12)) {
      if (/^[a-z]{1,20}$/.test(key) && typeof value === "boolean") groups[key] = value;
    }
  }
  return { collapsed: c === 1 || c === true, groups };
}

export function serializeNavPrefs(prefs: NavPrefs) {
  return encodeURIComponent(JSON.stringify({ c: prefs.collapsed ? 1 : 0, g: prefs.groups }));
}
