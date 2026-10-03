import Link from "next/link";
import { admin } from "@/content/admin-en";
import { requireAdmin } from "@/lib/session";

export default async function DashboardPage() {
  await requireAdmin();
  const { cards } = admin.dashboard;

  return (
    <>
      <h1 className="text-3xl text-brand">{admin.dashboard.title}</h1>
      <p className="mt-2 text-muted">{admin.dashboard.intro}</p>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <li>
          <Link
            href="/admin/settings"
            className="block h-full rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-lg"
          >
            <h2 className="text-xl text-brand">{cards.settings.title}</h2>
            <p className="mt-2 text-sm text-muted">{cards.settings.text}</p>
          </Link>
        </li>
        {[cards.posts, cards.team].map((card) => (
          <li key={card.title} className="h-full rounded-2xl border border-dashed border-line bg-white/60 p-6">
            <h2 className="text-xl text-muted">{card.title}</h2>
            <p className="mt-2 text-sm text-muted">{card.text}</p>
            <p className="mt-3 inline-block rounded-full bg-sand px-3 py-0.5 text-sm font-semibold text-muted">
              {admin.dashboard.soon}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
