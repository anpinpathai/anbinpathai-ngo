import type { MetadataRoute } from "next";
import { listPublicCodes } from "@/lib/directory/public";
import { directoryEnabled, directoryOpen } from "@/lib/directory/text";
import { listSitemapPosts } from "@/lib/public-posts";
import { getRadioConfig } from "@/lib/radio";
import { getSettings } from "@/lib/settings";
import { isStaging } from "@/lib/site-env";
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
  // The test copy of the website lists nothing for search engines.
  if (isStaging()) return [];

  const base = siteUrl();
  const [posts, settings] = await Promise.all([listSitemapPosts(), getSettings()]);
  const paths = getRadioConfig(settings) ? [...staticPaths, "/radio"] : staticPaths;

  // The Registry of writers and artists is listed only once the admin has switched it on.
  const registry = directoryEnabled(settings)
    ? [
        { url: `${base}/directory`, changeFrequency: "daily" as const },
        ...(directoryOpen(settings) ? [{ url: `${base}/directory/register`, changeFrequency: "monthly" as const }] : []),
        ...(await listPublicCodes()).map((p) => ({
          url: `${base}/directory/${p.code}`,
          lastModified: p.updatedAt,
          changeFrequency: "monthly" as const,
        })),
      ]
    : [];

  return [
    ...paths.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const })),
    ...registry,
    ...posts.map((p) => ({
      url: `${base}/posts/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
    })),
  ];
}
