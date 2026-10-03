import type { Metadata } from "next";
import { Noto_Sans_Tamil, Noto_Serif_Tamil } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { t } from "@/content/ta-LK";
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
  title: { default: t.siteName, template: `%s | ${t.siteShortName}` },
  description: t.tagline,
  openGraph: { locale: "ta_LK", siteName: t.siteName },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ta-LK"
      className={`${notoSansTamil.variable} ${notoSerifTamil.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
        >
          {t.a11y.skipToContent}
        </a>
        <Header />
        <div id="content" className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
