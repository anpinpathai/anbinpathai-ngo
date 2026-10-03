import type { Metadata } from "next";
import { Baloo_Thambi_2, Mukta_Malar } from "next/font/google";
import { t } from "@/content/ta-LK";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

// Body text: Mukta Malar, a friendly and readable Tamil font. Its letters run small (about 15% smaller than
// Noto Sans Tamil), so the public site's base text size is raised in globals.css to make up for it.
const bodyFont = Mukta_Malar({
  variable: "--font-tamil",
  subsets: ["tamil", "latin"],
  weight: ["400", "500", "600", "700"],
});

// Headings: Baloo Thambi 2, rounded and warm.
const headingFont = Baloo_Thambi_2({
  variable: "--font-tamil-heading",
  subsets: ["tamil", "latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: t.siteName, template: `%s | ${t.siteShortName}` },
  description: t.tagline,
  openGraph: {
    type: "website",
    locale: "ta_LK",
    siteName: t.siteName,
    title: t.siteName,
    description: t.tagline,
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ta-LK"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
