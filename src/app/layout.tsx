import type { Metadata } from "next";
import { Noto_Sans_Tamil, Noto_Serif_Tamil } from "next/font/google";
import { t } from "@/content/ta-LK";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const notoSansTamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil", "latin"],
});

const notoSerifTamil = Noto_Serif_Tamil({
  variable: "--font-tamil-heading",
  subsets: ["tamil", "latin"],
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
      className={`${notoSansTamil.variable} ${notoSerifTamil.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
