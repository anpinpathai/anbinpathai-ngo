export function siteUrl() {
  return (process.env.SITE_URL || process.env.URL || "http://localhost:3000").replace(/\/+$/, "");
}
