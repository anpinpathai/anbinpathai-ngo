import type { ReactNode } from "react";
import { postText, t } from "@/content/ta-LK";
import { getRadioConfig } from "@/lib/radio";
import { getSettings } from "@/lib/settings";
import { ToastProvider } from "./toast/ToastProvider";
import { RadioProvider } from "./radio/RadioProvider";
import { Footer } from "./Footer";
import { Header } from "./Header";

export async function SiteShell({ children }: { children: ReactNode }) {
  const radio = getRadioConfig(await getSettings());

  const shell = (
    <div className="flex min-h-screen flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        {t.a11y.skipToContent}
      </a>
      <Header showRadio={Boolean(radio)} />
      <div id="content" className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );

  // One player for the whole site, so the radio keeps playing while visitors move between pages.
  const withRadio = radio ? <RadioProvider {...radio}>{shell}</RadioProvider> : shell;

  // Small notices (for example "could not copy") use the site's own toast, never the browser's pop-up boxes.
  return (
    <ToastProvider placement="bottom" closeLabel={postText.gallery.close}>
      {withRadio}
    </ToastProvider>
  );
}
