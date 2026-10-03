import type { ReactNode } from "react";
import { t } from "@/content/ta-LK";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
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
    </div>
  );
}
