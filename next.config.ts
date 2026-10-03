import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
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
    experimental: { serverActions: { allowedOrigins: hosts } },
  };
}
