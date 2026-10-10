import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ContentGroups } from "@/components/ContentGroups";
import { PageHeader } from "@/components/PageHeader";
import { categories, categoryContent, postText } from "@/content/ta-LK";
import { categoryColor } from "@/lib/category-colors";
import { countPublished, getCategoryBySlug, listPublished, POSTS_PER_PAGE_PUBLIC } from "@/lib/public-posts";
import type { PostCardData } from "@/lib/post-types";
import { PostCard } from "./PostCard";

export async function CategoryListing({
  slug,
  page,
  basePath,
  renderFeatured,
}: {
  slug: string;
  page: number;
  basePath: string;
  renderFeatured?: (posts: PostCardData[]) => ReactNode;
}) {
  const category = await getCategoryBySlug(slug);
  const meta = categories.find((c) => c.slug === slug);
  if (!category || !meta) notFound();

  const total = await countPublished(category.id);
  const pages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE_PUBLIC));
  if (page > pages) notFound();

  const posts = await listPublished({
    categoryId: category.id,
    limit: POSTS_PER_PAGE_PUBLIC,
    offset: (page - 1) * POSTS_PER_PAGE_PUBLIC,
  });

  const color = categoryColor[meta.colorKey];
  const content = categoryContent[slug];
  const pageHref = (n: number) => (n <= 1 ? basePath : `${basePath}/page/${n}`);

  return (
    <main>
      <PageHeader
        title={category.name}
        tint={color.tint}
        titleClass={color.text}
        lead={content?.lead ? <p className="font-heading text-xl font-bold sm:text-2xl">{content.lead}</p> : undefined}
        icon={
          <span
            className={`hidden h-12 w-12 shrink-0 place-items-center rounded-full min-[360px]:grid sm:h-16 sm:w-16 ${color.solid}`}
          >
            <CategoryIcon slug={slug} className="h-8 w-8" />
          </span>
        }
      />

      {page === 1 && content && (
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-12">
          <ContentGroups groups={content.groups} dotClass={color.dot} />
        </section>
      )}

      {page === 1 && renderFeatured?.(posts)}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        <h2 className="mb-5 text-xl text-brand sm:mb-6 sm:text-2xl">{postText.latestTitle}</h2>
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-white/60 p-10 text-center text-muted">
            {postText.empty}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav className="mt-10 flex items-center justify-between gap-4" aria-label={category.name}>
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className={`inline-block py-2 font-semibold hover:underline ${color.text}`}>
                ← {postText.newer}
              </Link>
            ) : (
              <span />
            )}
            <span className="text-sm text-muted">{postText.pageOf(page, pages)}</span>
            {page < pages ? (
              <Link href={pageHref(page + 1)} className={`inline-block py-2 font-semibold hover:underline ${color.text}`}>
                {postText.older} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
