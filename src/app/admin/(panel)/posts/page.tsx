import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "@/components/CategoryBadge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/admin/Icon";
import { Notice } from "@/components/admin/Notice";
import { PageHeader } from "@/components/admin/PageHeader";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { button, card } from "@/components/admin/ui";
import { admin, categoryEnglish } from "@/content/admin-en";
import type { ColorKey } from "@/content/ta-LK";
import { categoryColor } from "@/lib/category-colors";
import { getPostCounts, listCategories, listPosts, POSTS_PER_PAGE } from "@/lib/posts";
import { requireAdmin } from "@/lib/session";
import { publicUrl } from "@/lib/storage";
import { deletePostAction, togglePublishAction } from "./actions";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Colombo",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const notices: Record<string, string> = {
  posted: "Your post is published.",
  draftsaved: "Saved as a draft.",
  deleted: admin.common.noticeDeleted,
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PostsPage(props: PageProps<"/admin/posts">) {
  await requireAdmin();

  const sp = await props.searchParams;
  const categoryParam = Number(first(sp.category));
  const statusParam = first(sp.status);
  const page = Math.max(1, Number(first(sp.page)) || 1);
  const notice = notices[first(sp.notice) ?? ""];

  const categoryId = Number.isInteger(categoryParam) && categoryParam > 0 ? categoryParam : undefined;
  const status = statusParam === "published" || statusParam === "draft" ? statusParam : undefined;

  const [categories, { rows, total }, counts] = await Promise.all([
    listCategories(),
    listPosts({ categoryId, status, page }),
    getPostCounts(),
  ]);

  const pages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  // Builds a link that keeps the other choices (tab, section) and changes one thing.
  const link = (next: { category?: number | null; status?: "published" | "draft" | null; page?: number }) => {
    const params = new URLSearchParams();
    const nextCategory = next.category === undefined ? categoryId : (next.category ?? undefined);
    const nextStatus = next.status === undefined ? status : (next.status ?? undefined);
    if (nextCategory) params.set("category", String(nextCategory));
    if (nextStatus) params.set("status", nextStatus);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const qs = params.toString();
    return qs ? `/admin/posts?${qs}` : "/admin/posts";
  };
  const returnTo = link({ page });

  const tabs = [
    { label: admin.posts.tabs.all, count: counts.total, value: null, active: !status },
    { label: admin.posts.tabs.published, count: counts.published, value: "published" as const, active: status === "published" },
    { label: admin.posts.tabs.draft, count: counts.drafts, value: "draft" as const, active: status === "draft" },
  ];

  return (
    <>
      <PageHeader
        title={admin.posts.title}
        description={admin.posts.subtitle}
        icon="file"
        actions={
          <Link href="/admin/posts/new" className={button.gold}>
            <Icon name="plus" className="h-5 w-5" />
            {admin.posts.newPost}
          </Link>
        }
      />

      {notice && (
        <div className="mb-5">
          <Notice>{notice}</Notice>
        </div>
      )}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label={admin.posts.title}>
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={link({ status: tab.value, page: 1 })}
            role="tab"
            aria-selected={tab.active}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold transition-colors ${
              tab.active ? "bg-brand text-white shadow-sm" : "bg-white text-ink ring-1 ring-line hover:bg-sand/60"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-2 text-sm font-bold ${tab.active ? "bg-white/20 text-white" : "bg-panel text-muted"}`}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2" aria-label={admin.posts.sections}>
        <Link
          href={link({ category: null, page: 1 })}
          className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
            !categoryId ? "bg-ink text-white" : "bg-white text-muted ring-1 ring-line hover:bg-sand/60"
          }`}
        >
          {admin.posts.allCategories}
        </Link>
        {categories.map((c) => {
          const active = categoryId === c.id;
          const color = categoryColor[c.colorKey as ColorKey];
          return (
            <Link
              key={c.id}
              href={link({ category: c.id, page: 1 })}
              title={c.name}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                active ? `${color.solid} shadow-sm` : "bg-white text-ink ring-1 ring-line hover:bg-sand/60"
              }`}
            >
              <span aria-hidden="true" className={`h-2 w-2 rounded-full ${active ? "bg-white" : color.dot}`} />
              {categoryEnglish[c.slug] ?? c.name}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className={`${card} mt-6 px-6 py-14 text-center`}>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand">
            <Icon name="file" className="h-7 w-7" />
          </span>
          <p className="mt-4 text-lg font-semibold text-ink">
            {counts.total === 0 ? admin.posts.emptyAll : admin.posts.emptyFiltered}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {counts.total === 0 ? (
              <Link href="/admin/posts/new" className={button.primary}>
                <Icon name="plus" className="h-5 w-5" />
                {admin.posts.newPost}
              </Link>
            ) : (
              <Link href="/admin/posts" className={button.secondary}>
                {admin.posts.clearFilters}
              </Link>
            )}
          </div>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((post) => {
            const cover = publicUrl(post.galleryKeys[0]);
            const edit = `/admin/posts/${post.id}`;
            return (
              <li key={post.id} className={`${card} p-4 sm:p-5`}>
                <div className="flex gap-4">
                  <Link href={edit} className="shrink-0" tabIndex={-1} aria-hidden="true">
                    {cover ? (
                      <Image
                        src={cover}
                        alt=""
                        width={192}
                        height={192}
                        unoptimized
                        className="h-20 w-20 rounded-xl border border-line object-cover sm:h-24 sm:w-24"
                      />
                    ) : (
                      <span className="grid h-20 w-20 place-items-center rounded-xl bg-sand text-lg font-bold text-muted sm:h-24 sm:w-24">
                        Aa
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <CategoryBadge
                        name={categoryEnglish[post.categorySlug] ?? post.categoryName}
                        colorKey={post.categoryColor as ColorKey}
                      />
                      <span
                        className={`rounded-full px-3 py-0.5 text-sm font-bold ${
                          post.published ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {post.published ? admin.posts.published : admin.posts.draft}
                      </span>
                      <span className="text-sm text-muted">{dateFormat.format(post.publishedAt ?? post.createdAt)}</span>
                    </div>
                    <Link
                      href={edit}
                      lang="ta"
                      className="mt-1.5 line-clamp-2 text-lg font-semibold leading-snug text-ink transition-colors hover:text-brand"
                    >
                      {post.excerpt || post.title || admin.posts.noText}
                    </Link>
                    {(post.galleryKeys.length > 0 || post.youtubeUrl || post.facebookUrl) && (
                      <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                        {post.galleryKeys.length > 0 && (
                          <span className="inline-flex items-center gap-1.5">
                            <Icon name="image" className="h-4 w-4" />
                            {admin.posts.photoCount(post.galleryKeys.length)}
                          </span>
                        )}
                        {post.youtubeUrl && (
                          <span className="inline-flex items-center gap-1.5">
                            <Icon name="video" className="h-4 w-4" />
                            {admin.posts.hasVideo}
                          </span>
                        )}
                        {post.facebookUrl && (
                          <span className="inline-flex items-center gap-1.5">
                            <Icon name="facebook" className="h-4 w-4" />
                            {admin.posts.hasFacebook}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line/70 pt-3">
                  <Link href={edit} className={button.small}>
                    <Icon name="edit" className="h-4 w-4" />
                    {admin.common.edit}
                  </Link>
                  {post.published && (
                    <Link href={`/posts/${post.slug}`} target="_blank" rel="noopener noreferrer" className={button.small}>
                      <Icon name="externalLink" className="h-4 w-4" />
                      {admin.posts.view}
                    </Link>
                  )}
                  <form action={togglePublishAction}>
                    <input type="hidden" name="id" value={post.id} />
                    <input type="hidden" name="publish" value={post.published ? "false" : "true"} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <SubmitButton pendingLabel={admin.posts.publishing} className={button.small}>
                      <Icon name={post.published ? "eyeOff" : "send"} className="h-4 w-4" />
                      {post.published ? admin.posts.unpublish : admin.posts.publish}
                    </SubmitButton>
                  </form>
                  <span className="ml-auto">
                    <DeleteButton
                      action={deletePostAction}
                      id={post.id}
                      label={admin.common.delete}
                      title={admin.posts.deleteTitle}
                      confirmMessage={admin.posts.confirmDelete}
                    />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-between gap-3" aria-label={admin.posts.title}>
          {page > 1 ? (
            <Link href={link({ page: page - 1 })} className={button.secondary}>
              <Icon name="arrowLeft" className="h-4 w-4" />
              {admin.posts.previous}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm font-semibold text-muted">{admin.posts.page(page, pages)}</span>
          {page < pages ? (
            <Link href={link({ page: page + 1 })} className={button.secondary}>
              {admin.posts.next}
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
