"use client";

import { useState } from "react";
import { pages } from "@/content/ta-LK";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      try {
        window.prompt(pages.donate.copy, value);
      } catch {}
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className="rounded-full border-2 border-brand px-4 py-1 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
    >
      {copied ? pages.donate.copied : pages.donate.copy}
    </button>
  );
}
