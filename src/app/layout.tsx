import type { Metadata } from "next";
import { Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";

const notoSansTamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil", "latin"],
});

export const metadata: Metadata = {
  title: "அன்பின்பாதை எண்ணம்போல் வாழ்க்கை கலை இலக்கிய மன்றம் – திருகோணமலை",
  description: "மண்ணும் மனிதமும் காப்போம்",
  openGraph: { locale: "ta_LK" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ta-LK" className={`${notoSansTamil.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
