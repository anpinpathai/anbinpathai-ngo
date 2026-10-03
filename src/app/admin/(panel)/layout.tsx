import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminUsername } from "@/lib/admin-user";
import { requireAdmin } from "@/lib/session";
import { logout } from "../actions";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const { adminId } = await requireAdmin();
  const username = await getAdminUsername(adminId);

  return (
    <AdminShell username={username} logoutAction={logout}>
      {children}
    </AdminShell>
  );
}
