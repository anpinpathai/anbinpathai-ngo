import "server-only";
import { and, asc, count, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, posts } from "@/db/schema";
import type { ColorKey } from "@/content/ta-LK";
import { formatDateTa } from "@/lib/format-date";
import type { LatestTab, PostCardData } from "@/lib/post-types";
import { snippetAfterTitle } from "@/lib/post-render";
import { publicUrl } from "@/lib/storage";
import { parseYoutubeId } from "@/lib/youtube";

export const POSTS_PER_PAGE_PUBLIC = 12;

const cardColumns = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  galleryKeys: posts.galleryKeys,
  youtubeUrl: posts.youtubeUrl,
  facebookUrl: posts.facebookUrl,
  publishedAt: posts.publishedAt,
  createdAt: posts.createdAt,
  categorySlug: categories.slug,
  categoryName: categories.name,
  categoryColor: categories.colorKey,
};

type CardRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  galleryKeys: string[];
  youtubeUrl: string | null;
  facebookUrl: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  categorySlug: string;
  categoryName: string;
  categoryColor: string;
};

function toCard(row: CardRow): PostCardData {
  const photo = publicUrl(row.galleryKeys[0]);
  const youtubeId = row.youtubeUrl ? parseYoutubeId(row.youtubeUrl) : null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    snippet: snippetAfterTitle(row.title, row.excerpt),
    coverUrl: photo ?? (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null),
    coverIsVideo: !photo && Boolean(youtubeId),
    youtubeId,
    dateText: formatDateTa(row.publishedAt ?? row.createdAt),
    photoCount: row.galleryKeys.length,
    hasVideo: Boolean(row.youtubeUrl),
    hasFacebook: Boolean(row.facebookUrl),
    categorySlug: row.categorySlug,
    categoryName: row.categoryName,
    categoryColor: row.categoryColor as ColorKey,
  };
}

const newestFirst = [desc(sql`coalesce(${posts.publishedAt}, ${posts.createdAt})`), desc(posts.id)];

export async function getCategoryBySlug(slug: string) {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ?? null;
}

export async function listPublished(options: { categoryId?: number; limit: number; offset?: number }) {
  const rows = await db
    .select(cardColumns)
    .from(posts)
    .innerJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.published, true), options.categoryId ? eq(posts.categoryId, options.categoryId) : undefined))
    .orderBy(...newestFirst)
    .limit(options.limit)
    .offset(options.offset ?? 0);
  return rows.map(toCard);
}

export async function countPublished(categoryId: number) {
  const [row] = await db
    .select({ total: count() })
    .from(posts)
    .where(and(eq(posts.published, true), eq(posts.categoryId, categoryId)));
  return row?.total ?? 0;
}

export async function getLatestTabs(limit: number): Promise<Omit<LatestTab, "href">[]> {
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  return Promise.all(
    cats.map(async (c) => ({
      slug: c.slug,
      name: c.name,
      colorKey: c.colorKey as ColorKey,
      posts: await listPublished({ categoryId: c.id, limit }),
    })),
  );
}

export async function getPublishedPost(slug: string) {
  const [row] = await db
    .select({
      ...cardColumns,
      body: posts.body,
      categoryId: posts.categoryId,
    })
    .from(posts)
    .innerJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.slug, slug), eq(posts.published, true)))
    .limit(1);
  return row ?? null;
}

export async function getRelated(categoryId: number, excludeId: number, limit = 3) {
  const rows = await db
    .select(cardColumns)
    .from(posts)
    .innerJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.published, true), eq(posts.categoryId, categoryId), ne(posts.id, excludeId)))
    .orderBy(...newestFirst)
    .limit(limit);
  return rows.map(toCard);
}

export async function listSitemapPosts() {
  return db
    .select({ slug: posts.slug, updatedAt: posts.updatedAt })
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(...newestFirst);
}

export async function listRecentSlugs(limit: number) {
  const rows = await db
    .select({ slug: posts.slug })
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(...newestFirst)
    .limit(limit);
  return rows.map((r) => r.slug);
}
