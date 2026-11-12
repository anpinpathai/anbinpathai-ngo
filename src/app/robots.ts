import type { MetadataRoute } from "next";
import { isStaging } from "@/lib/site-env";
import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  // The test copy of the website must never appear in Google.
  if (isStaging()) return { rules: [{ userAgent: "*", disallow: "/" }] };

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
