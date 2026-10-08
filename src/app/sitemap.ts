import type { MetadataRoute } from "next";
import { listSitemapPosts } from "@/lib/public-posts";
import { getRadioConfig } from "@/lib/radio";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site-url";

const staticPaths = [
  "/",
  "/about",
  "/team",
  "/activities/social",
  "/activities/green",
  "/activities/arts",
  "/activities/students",
  "/activities/circle",
  "/reading",
  "/donate",
  "/contact",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [posts, settings] = await Promise.all([listSitemapPosts(), getSettings()]);
  const paths = getRadioConfig(settings) ? [...staticPaths, "/radio"] : staticPaths;

  return [
    ...paths.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const })),
    ...posts.map((p) => ({
      url: `${base}/posts/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
    })),
  ];
}
