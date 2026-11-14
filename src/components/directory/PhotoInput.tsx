"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { resizeImage } from "@/lib/image-resize";
import type { FormUi } from "@/lib/directory/ui-text";

// Choose a photo, shrink it on the visitor's own device, and upload it. The form then keeps only its file name.
export function PhotoInput({
  name,
  initialKey,
  initialUrl,
  uploadUrl,
  ui,
  error,
  onChange,
}: {
  name: string;
  initialKey: string;
  initialUrl: string | null;
  uploadUrl: string;
  ui: FormUi;
  error?: string;
  onChange?: () => void;
}) {
  const [key, setKey] = useState(initialKey);
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function choose(file: File) {
    setBusy(true);
    setProblem(null);
    try {
      const blob = await resizeImage(file, 900);
      const body = new FormData();
      body.append("file", blob, "photo");
      const res = await fetch(uploadUrl, { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { key?: string; url?: string; error?: string };
      if (!res.ok || !data.key || !data.url) {
        setProblem(data.error === "too_many" ? ui.tooMany : ui.photoFailed);
        return;
      }
      setKey(data.key);
      setUrl(data.url);
      onChange?.();
    } catch {
      setProblem(ui.photoFailed);
    } finally {
      setBusy(false);
    }
  }

  const shown = problem ?? error ?? null;

  return (
    <div className="mt-1.5">
      <input type="hidden" name={name} value={key} />
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void choose(file);
        }}
      />
      <div className="flex flex-wrap items-center gap-4">
        {url ? (
          <Image src={url} alt="" width={160} height={160} unoptimized className="h-28 w-28 rounded-full border-4 border-sand object-cover" />
        ) : (
          <span className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-2 border-dashed border-line bg-sand/50 px-2 text-center text-xs text-muted">
            {busy ? ui.photoUploading : ui.photoNone}
          </span>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="inline-flex items-center rounded-full border-2 border-brand px-5 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white disabled:opacity-60"
          >
            {busy ? ui.photoUploading : url ? ui.photoChange : ui.photoChoose}
          </button>
          {url && !busy && (
            <button
              type="button"
              onClick={() => {
                setKey("");
                setUrl(null);
                onChange?.();
              }}
              className="text-sm font-semibold text-red-700 underline-offset-4 hover:underline"
            >
              {ui.photoRemove}
            </button>
          )}
        </div>
      </div>
      {shown && (
        <p role="alert" className="mt-2 text-sm font-semibold text-red-700">
          {shown}
        </p>
      )}
    </div>
  );
}
