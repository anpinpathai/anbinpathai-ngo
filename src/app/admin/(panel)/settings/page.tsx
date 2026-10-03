import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";

// Settings used to be one long page. It is now split into three, so send old links to the first.
export default async function SettingsIndexPage() {
  await requireAdmin();
  redirect("/admin/settings/home");
}
