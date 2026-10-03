import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "@/components/CategoryBadge";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { admin } from "@/content/admin-en";
import type { ColorKey } from "@/content/ta-LK";
import { listCategories, listPosts, POSTS_PER_PAGE } from "@/lib/posts";
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

  const [categories, { rows, total }] = await Promise.all([
    listCategories(),
    listPosts({ categoryId, status, page }),
  ]);

  const pages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));

  const query = (nextPage: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.set("category", String(categoryId));
    if (status) params.set("status", status);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/posts?${qs}` : "/admin/posts";
  };
  const returnTo = query(page);

  const selectClass =
    "rounded-lg border border-line bg-white px-3 py-2 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl text-brand">{admin.posts.title}</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-brand px-6 py-2.5 font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          {admin.posts.newPost}
        </Link>
      </div>

      {notice && (
        <p role="status" className="mt-5 rounded-lg bg-green-50 px-4 py-2 font-semibold text-cat-green">
          {notice}
        </p>
      )}

      <form method="get" className="mt-6 flex flex-wrap items-center gap-3">
        <select name="category" defaultValue={categoryId ? String(categoryId) : ""} className={selectClass} aria-label={admin.posts.columns.category}>
          <option value="">{admin.posts.allCategories}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status ?? ""} className={selectClass} aria-label={admin.posts.columns.status}>
          <option value="">{admin.posts.allStatuses}</option>
          <option value="published">{admin.posts.published}</option>
          <option value="draft">{admin.posts.draft}</option>
        </select>
        <button type="submit" className="rounded-full border-2 border-brand px-5 py-1.5 font-semibold text-brand hover:bg-brand hover:text-white">
          {admin.posts.filter}
        </button>
      </form>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line bg-white/60 p-8 text-center text-muted">
          {admin.posts.empty}
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[44rem] text-left">
            <thead className="border-b border-line bg-sand/50 text-sm text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">{admin.posts.columns.post}</th>
                <th className="px-4 py-3 font-semibold">{admin.posts.columns.category}</th>
                <th className="px-4 py-3 font-semibold">{admin.posts.columns.status}</th>
                <th className="px-4 py-3 font-semibold">{admin.posts.columns.date}</th>
                <th className="px-4 py-3 font-semibold">{admin.posts.columns.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((post) => (
                <tr key={post.id} className="align-top">
                  <td className="px-4 py-3">
                    <Link href={`/admin/posts/${post.id}`} className="flex items-start gap-3">
                      {publicUrl(post.galleryKeys[0]) ? (
                        <Image
                          src={publicUrl(post.galleryKeys[0])!}
                          alt=""
                          width={128}
                          height={128}
                          unoptimized
                          className="h-16 w-16 shrink-0 rounded-lg border border-line object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-sand text-xs text-muted"
                        >
                          Aa
                        </span>
                      )}
                      <span className="min-w-0">
                        <span lang="ta" className="line-clamp-2 font-semibold text-brand">
                          {post.excerpt || post.title}
                        </span>
                        <span className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
                          {post.galleryKeys.length > 0 && <span>{admin.posts.photoCount(post.galleryKeys.length)}</span>}
                          {post.youtubeUrl && <span>{admin.posts.hasVideo}</span>}
                          {post.facebookUrl && <span>{admin.posts.hasFacebook}</span>}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <CategoryBadge name={post.categoryName} colorKey={post.categoryColor as ColorKey} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-0.5 text-sm font-semibold ${
                        post.published ? "bg-green-50 text-cat-green" : "bg-sand text-muted"
                      }`}
                    >
                      {post.published ? admin.posts.published : admin.posts.draft}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-muted">
                    {dateFormat.format(post.publishedAt ?? post.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      <Link href={`/admin/posts/${post.id}`} className="font-semibold text-brand underline-offset-4 hover:underline">
                        {admin.common.edit}
                      </Link>
                      {post.published && (
                        <Link
                          href={`/posts/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-brand underline-offset-4 hover:underline"
                        >
                          {admin.posts.view}
                        </Link>
                      )}
                      <form action={togglePublishAction}>
                        <input type="hidden" name="id" value={post.id} />
                        <input type="hidden" name="publish" value={post.published ? "false" : "true"} />
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <button type="submit" className="font-semibold text-brand underline-offset-4 hover:underline">
                          {post.published ? admin.posts.unpublish : admin.posts.publish}
                        </button>
                      </form>
                      <DeleteButton
                        action={deletePostAction}
                        id={post.id}
                        label={admin.common.delete}
                        confirmMessage={admin.posts.confirmDelete}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-between" aria-label={admin.posts.title}>
          {page > 1 ? (
            <Link href={query(page - 1)} className="font-semibold text-brand hover:underline">
              ← {admin.posts.previous}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted">{admin.posts.page(page, pages)}</span>
          {page < pages ? (
            <Link href={query(page + 1)} className="font-semibold text-brand hover:underline">
              {admin.posts.next} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
