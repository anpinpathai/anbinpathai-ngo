import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// The address photos are served from (the R2 public address). Browsers may load pictures only from here and
// from the website itself.
function photoOrigin() {
  try {
    return new URL(process.env.R2_PUBLIC_URL ?? "").origin;
  } catch {
    return "";
  }
}

// Content Security Policy: tells the browser exactly where the site may load things from, so an injected
// script or a stray embed from anywhere else is refused. The pages are saved and re-used (not made fresh for
// every visit), so a per-visit "nonce" cannot be used; inline scripts must stay allowed, but everything else
// is closed: no plugins, no <base> tag tricks, forms and framing only by the site itself.
// Only used on the live build: `npm run dev` needs eval and websockets that this policy would block.
function contentSecurityPolicy() {
  const photos = photoOrigin();
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    // Photos from our own storage, and the thumbnail YouTube gives for a video post that has no photo.
    `img-src 'self' data: blob: https://i.ytimg.com${photos ? ` ${photos}` : ""}`,
    "font-src 'self' data:",
    // The radio stream and the "now playing" address are set by the admin, so any https address is allowed.
    "media-src 'self' blob: https:",
    "connect-src 'self' https:",
    // Only the YouTube and Facebook players that posts embed.
    "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://*.facebook.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "manifest-src 'self'",
  ].join("; ");
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Do not announce "X-Powered-By: Next.js" on every response.
  poweredByHeader: false,

  // Next.js's build cache writes the values of the settings it reads while building (session secret,
  // photo-storage keys) into files under .next/cache. Netlify's secret scanner rightly refuses that,
  // so the build cache is off. Builds are a few seconds slower, and no secret is ever written to a cache file.
  experimental: { turbopackFileSystemCacheForBuild: false },

  async headers() {
    const policy =
      process.env.NODE_ENV === "production"
        ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy() }]
        : [];

    return [
      { source: "/:path*", headers: [...securityHeaders, ...policy] },
      {
        // The admin panel and its API are never saved by a browser or a shared cache.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
};

// While you develop, an ngrok tunnel is a different address from localhost, and Next.js refuses to give its
// development files (the scripts that make buttons work) to any address that is not on an allow-list.
// So ask ngrok's own local agent which address the tunnel has right now, and allow exactly that one.
// This does nothing when ngrok is not running, and it is only used by `npm run dev`, never on the live site.
// Start ngrok first, then `npm run dev` (or restart `npm run dev` after the tunnel address changes).
async function currentTunnelHosts(): Promise<string[]> {
  try {
    const res = await fetch("http://127.0.0.1:4040/api/tunnels", { signal: AbortSignal.timeout(1500) });
    const data = (await res.json()) as { tunnels?: { public_url?: string }[] };
    return (data.tunnels ?? []).flatMap((tunnel) => {
      try {
        return tunnel.public_url ? [new URL(tunnel.public_url).hostname] : [];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

export default async function config(phase: string): Promise<NextConfig> {
  if (phase !== PHASE_DEVELOPMENT_SERVER) return nextConfig;

  const hosts = await currentTunnelHosts();
  if (hosts.length === 0) return nextConfig;

  console.log(`Allowing the ngrok tunnel in development: ${hosts.join(", ")}`);
  return {
    ...nextConfig,
    allowedDevOrigins: hosts,
    experimental: { ...nextConfig.experimental, serverActions: { allowedOrigins: hosts } },
  };
}
