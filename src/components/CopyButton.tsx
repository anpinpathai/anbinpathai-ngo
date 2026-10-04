"use client";

import { useState } from "react";
import { CopyIcon } from "@/components/CopyIcon";
import { useToast } from "@/components/toast/ToastProvider";
import { pages, postText } from "@/content/ta-LK";
import { copyText } from "@/lib/clipboard";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  async function copy() {
    if (await copyText(value)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error(postText.copyFailed);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className="inline-flex items-center gap-2 rounded-full border-2 border-brand px-4 py-1 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
    >
      <CopyIcon done={copied} />
      <span lang="en">{copied ? pages.donate.copied : pages.donate.copy}</span>
    </button>
  );
}
