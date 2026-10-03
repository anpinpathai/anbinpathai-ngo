"use client";

import { useState } from "react";
import { postText } from "@/content/ta-LK";

const buttonClass =
  "inline-flex items-center rounded-full border-2 border-brand px-4 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white";

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  function open(base: string) {
    window.open(base, "_blank", "noopener,noreferrer,width=640,height=560");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      try {
        window.prompt(postText.copyLink, window.location.href);
      } catch {}
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-semibold">{postText.share}</span>
      <button
        type="button"
        onClick={() =>
          open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)
        }
        className={buttonClass}
      >
        {postText.shareFacebook}
      </button>
      <button
        type="button"
        onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${title} ${window.location.href}`)}`)}
        className={buttonClass}
      >
        {postText.shareWhatsapp}
      </button>
      <button type="button" onClick={copy} className={buttonClass} aria-live="polite">
        {copied ? postText.copied : postText.copyLink}
      </button>
    </div>
  );
}
