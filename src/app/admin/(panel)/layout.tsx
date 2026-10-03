import Image from "next/image";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { admin } from "@/content/admin-en";
import { requireAdmin } from "@/lib/session";
import { logout } from "../actions";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();

  return (
    <>
      <header className="bg-brand-dark text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Image src="/logos/logo-anbin.webp" alt="" width={40} height={40} unoptimized className="h-10 w-10 rounded-full" />
            <span className="font-heading text-lg font-bold">{admin.title}</span>
          </div>
          <AdminNav />
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/85 underline-offset-4 hover:text-gold hover:underline"
            >
              {admin.nav.viewSite}
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-white/40 px-4 py-1.5 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
              >
                {admin.nav.logout}
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
