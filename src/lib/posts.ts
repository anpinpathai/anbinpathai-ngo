import "server-only";
import { randomBytes } from "node:crypto";
import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, posts } from "@/db/schema";

export type PostInput = {
  title: string;
  categoryId: number;
  excerpt: string;
  body: string;
  galleryKeys: string[];
  youtubeUrl: string | null;
  facebookUrl: string | null;
  published: boolean;
  publishedAt: Date | null;
};

export type PostListFilters = {
  categoryId?: number;
  status?: "published" | "draft";
  page: number;
};

export const POSTS_PER_PAGE = 20;

function newSlug() {
  return randomBytes(6).toString("base64url").toLowerCase().replace(/[-_]/g, "x").slice(0, 8);
}

function isUniqueViolation(err: unknown) {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}

export function listCategories() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function listPosts(filters: PostListFilters) {
  const where = and(
    filters.categoryId ? eq(posts.categoryId, filters.categoryId) : undefined,
    filters.status ? eq(posts.published, filters.status === "published") : undefined,
  );

  const rows = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      galleryKeys: posts.galleryKeys,
      youtubeUrl: posts.youtubeUrl,
      facebookUrl: posts.facebookUrl,
      published: posts.published,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      categoryName: categories.name,
      categorySlug: categories.slug,
      categoryColor: categories.colorKey,
    })
    .from(posts)
    .innerJoin(categories, eq(posts.categoryId, categories.id))
    .where(where)
    .orderBy(desc(sql`coalesce(${posts.publishedAt}, ${posts.createdAt})`), desc(posts.id))
    .limit(POSTS_PER_PAGE)
    .offset((filters.page - 1) * POSTS_PER_PAGE);

  const [{ total }] = await db.select({ total: count() }).from(posts).where(where);
  return { rows, total };
}

export async function getPostCounts() {
  const [row] = await db
    .select({
      total: count(),
      published: sql<number>`count(*) filter (where ${posts.published})`.mapWith(Number),
    })
    .from(posts);
  return { total: row.total, published: row.published, drafts: row.total - row.published };
}

export async function getPost(id: number) {
  const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return row ?? null;
}

export async function createPost(input: PostInput) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const [row] = await db
        .insert(posts)
        .values({ ...input, slug: newSlug() })
        .returning({ id: posts.id });
      return row.id;
    } catch (err) {
      if (!isUniqueViolation(err) || attempt === 3) throw err;
    }
  }
  throw new Error("Could not create a unique post address");
}

export async function updatePost(id: number, input: PostInput) {
  const rows = await db
    .update(posts)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning({ id: posts.id });
  return rows.length > 0;
}

export async function deletePost(id: number) {
  const [row] = await db
    .delete(posts)
    .where(eq(posts.id, id))
    .returning({ galleryKeys: posts.galleryKeys });
  return row ?? null;
}

export async function setPublished(id: number, published: boolean) {
  await db
    .update(posts)
    .set({
      published,
      publishedAt: published ? sql`coalesce(${posts.publishedAt}, now())` : posts.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));
}
