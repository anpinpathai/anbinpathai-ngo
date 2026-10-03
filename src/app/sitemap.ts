import type { MetadataRoute } from "next";
import { listSitemapPosts } from "@/lib/public-posts";
import { siteUrl } from "@/lib/site-url";

const staticPaths = [
  "/",
  "/about",
  "/team",
  "/activities/social",
  "/activities/green",
  "/activities/arts",
  "/reading",
  "/donate",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const posts = await listSitemapPosts();

  return [
    ...staticPaths.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const })),
    ...posts.map((p) => ({
      url: `${base}/posts/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
    })),
  ];
}
