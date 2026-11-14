import type { MetadataRoute } from "next";
import { isStaging } from "@/lib/site-env";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  // The test copy of the website must never appear in Google.
  if (isStaging()) return { rules: [{ userAgent: "*", disallow: "/" }] };

  return {
    // The reviewer pages are private links, so search engines must never list them.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/directory/review"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
