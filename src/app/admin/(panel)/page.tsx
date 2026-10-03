import Link from "next/link";
import { admin } from "@/content/admin-en";
import { requireAdmin } from "@/lib/session";

export default async function DashboardPage() {
  await requireAdmin();
  const { cards } = admin.dashboard;

  const items = [
    { href: "/admin/posts", ...cards.posts },
    { href: "/admin/team", ...cards.team },
    { href: "/admin/settings", ...cards.settings },
  ];

  return (
    <>
      <h1 className="text-3xl text-brand">{admin.dashboard.title}</h1>
      <p className="mt-2 text-muted">{admin.dashboard.intro}</p>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block h-full rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-lg"
            >
              <h2 className="text-xl text-brand">{item.title}</h2>
              <p className="mt-2 text-sm text-muted">{item.text}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
