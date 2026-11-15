import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminUsername } from "@/lib/admin-user";
import { NAV_COOKIE, parseNavPrefs } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/session";
import { logout } from "../actions";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const { adminId } = await requireAdmin();
  const username = await getAdminUsername(adminId);
  // How the admin left the menu last time (which groups are open, whether it is shrunk to icons).
  const nav = parseNavPrefs((await cookies()).get(NAV_COOKIE)?.value);

  return (
    <AdminShell username={username} logoutAction={logout} initialNav={nav}>
      {children}
    </AdminShell>
  );
}
