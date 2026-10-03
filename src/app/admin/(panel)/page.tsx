import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Icon, type IconName } from "@/components/admin/Icon";
import { button, card } from "@/components/admin/ui";
import { admin } from "@/content/admin-en";
import type { ColorKey } from "@/content/ta-LK";
import { getPostCounts, listPosts } from "@/lib/posts";
import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { publicUrl } from "@/lib/storage";
import { listMembers } from "@/lib/team";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Colombo",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Colombo", hour: "numeric", hourCycle: "h23" }).format(new Date()),
  );
  const { morning, afternoon, evening } = admin.dashboard.greeting;
  return hour < 12 ? morning : hour < 17 ? afternoon : evening;
}

function StatCard({ href, icon, value, label, tone }: { href: string; icon: IconName; value: number; label: string; tone: string }) {
  return (
    <Link
      href={href}
      className={`${card} group flex flex-col items-center gap-2 p-3 text-center transition-shadow hover:shadow-md sm:flex-row sm:gap-4 sm:p-5 sm:text-left`}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl sm:h-12 sm:w-12 ${tone}`}>
        <Icon name={icon} className="h-5 w-5 sm:h-6 sm:w-6" />
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-bold leading-none text-brand-dark sm:text-3xl">{value}</span>
        <span className="mt-1 block text-xs font-semibold leading-tight text-muted sm:text-sm">{label}</span>
      </span>
      <Icon name="chevronRight" className="ml-auto hidden h-5 w-5 text-line transition-colors group-hover:text-brand sm:block" />
    </Link>
  );
}

export default async function DashboardPage() {
  await requireAdmin();

  const [settings, counts, recent, members] = await Promise.all([
    getSettings(),
    getPostCounts(),
    listPosts({ page: 1 }),
    listMembers(),
  ]);

  const withPhoto = members.filter((m) => m.photoKey).length;
  const text = admin.dashboard.checklist;
  const filled = (key: string) => Boolean(settings[key]?.trim());

  const tasks: { done: boolean; label: string; hint: string; href: string; icon: IconName }[] = [
    { done: filled("home_banner"), ...text.items.banner, href: "/admin/settings/home", icon: "layout" },
    {
      done: filled("bank_name") && filled("bank_account_number"),
      ...text.items.bank,
      href: "/admin/settings/donation",
      icon: "heart",
    },
    {
      done: filled("contact_phone") || filled("contact_email") || filled("contact_address"),
      ...text.items.contact,
      href: "/admin/settings/contact",
      icon: "phone",
    },
    {
      done: filled("facebook_url") || filled("youtube_url"),
      ...text.items.social,
      href: "/admin/settings/contact",
      icon: "globe",
    },
    {
      done: members.length > 0 && withPhoto === members.length,
      label: text.items.photos.label,
      hint: text.items.photos.hint(withPhoto, members.length),
      href: "/admin/team",
      icon: "users",
    },
    { done: counts.published > 0, ...text.items.post, href: "/admin/posts/new", icon: "file" },
  ];
  const doneCount = tasks.filter((task) => task.done).length;
  const heroLink =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-white/20";

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-brand to-[#4a1d8f] p-6 text-white shadow-lg sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-gold/25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl font-bold sm:text-3xl">{greeting()} 👋</h1>
          <p className="mt-1 text-lg text-white/80">{admin.dashboard.question}</p>
          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
            <Link href="/admin/posts/new" className={button.gold}>
              <Icon name="edit" className="h-5 w-5" />
              {admin.dashboard.actions.post}
            </Link>
            <Link href="/admin/team/new" className={heroLink}>
              <Icon name="users" className="h-5 w-5" />
              {admin.dashboard.actions.member}
            </Link>
            <Link href="/admin/settings/home" className={heroLink}>
              <Icon name="layout" className="h-5 w-5" />
              {admin.dashboard.actions.home}
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-3 gap-3 sm:gap-4" aria-label="Summary">
        <StatCard
          href="/admin/posts?status=published"
          icon="checkCircle"
          value={counts.published}
          label={admin.dashboard.stats.published}
          tone="bg-green-50 text-cat-green"
        />
        <StatCard
          href="/admin/posts?status=draft"
          icon="edit"
          value={counts.drafts}
          label={admin.dashboard.stats.drafts}
          tone="bg-amber-50 text-amber-700"
        />
        <StatCard
          href="/admin/team"
          icon="users"
          value={members.length}
          label={admin.dashboard.stats.members}
          tone="bg-brand/10 text-brand"
        />
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className={`${card} p-5 sm:p-6`}>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-brand-dark">{text.title}</h2>
            <span className="shrink-0 rounded-full bg-brand/10 px-3 py-0.5 text-sm font-bold text-brand">
              {text.progress(doneCount, tasks.length)}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={tasks.length}
            aria-valuenow={doneCount}
            className="mt-3 h-2 overflow-hidden rounded-full bg-sand"
          >
            <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${(doneCount / tasks.length) * 100}%` }} />
          </div>
          {doneCount === tasks.length && (
            <p className="mt-4 flex items-center gap-2 font-semibold text-green-700">
              <Icon name="checkCircle" className="h-5 w-5" />
              {text.allDone}
            </p>
          )}
          <ul className="mt-4 divide-y divide-line/70">
            {tasks.map((task) => (
              <li key={task.label}>
                <Link href={task.href} className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-panel">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                      task.done ? "bg-green-100 text-green-700" : "bg-gold/25 text-amber-800"
                    }`}
                  >
                    <Icon name={task.done ? "check" : task.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block font-semibold ${task.done ? "text-muted line-through decoration-1" : "text-ink"}`}>
                      {task.label}
                    </span>
                    <span className="block truncate text-sm text-muted">{task.hint}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-brand group-hover:underline">
                    {task.done ? text.open : text.setUp}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${card} p-5 sm:p-6`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-brand-dark">{admin.dashboard.recent.title}</h2>
            <Link href="/admin/posts" className="text-sm font-bold text-brand hover:underline">
              {admin.dashboard.recent.viewAll}
            </Link>
          </div>

          {recent.rows.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-line bg-panel/60 p-6 text-center">
              <p className="text-muted">{admin.dashboard.recent.empty}</p>
              <Link href="/admin/posts/new" className={`${button.primary} mt-4`}>
                <Icon name="plus" className="h-5 w-5" />
                {admin.posts.newPost}
              </Link>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-line/70">
              {recent.rows.slice(0, 5).map((post) => {
                const cover = publicUrl(post.galleryKeys[0]);
                return (
                  <li key={post.id}>
                    <Link href={`/admin/posts/${post.id}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-panel">
                      {cover ? (
                        <Image src={cover} alt="" width={96} height={96} unoptimized className="h-12 w-12 shrink-0 rounded-xl border border-line object-cover" />
                      ) : (
                        <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sand text-sm font-bold text-muted">
                          Aa
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span lang="ta" className="line-clamp-1 font-semibold text-ink">
                          {post.excerpt || post.title || admin.posts.noText}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
                          <span>{dateFormat.format(post.publishedAt ?? post.createdAt)}</span>
                          <span aria-hidden="true">·</span>
                          <span className={post.published ? "font-semibold text-green-700" : "font-semibold text-amber-700"}>
                            {post.published ? admin.posts.published : admin.posts.draft}
                          </span>
                        </span>
                      </span>
                      <span className="hidden shrink-0 sm:block">
                        <CategoryBadge name={post.categoryName} colorKey={post.categoryColor as ColorKey} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
