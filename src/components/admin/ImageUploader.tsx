"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { admin } from "@/content/admin-en";
import { uploadErrorMessage, uploadImage } from "@/lib/upload-client";
import { Icon } from "./Icon";
import { button } from "./ui";

export function ImageUploader({
  name,
  initialKey,
  initialUrl,
  error,
  maxSide = 1600,
  shape = "wide",
  onChange,
}: {
  name: string;
  initialKey: string;
  initialUrl: string | null;
  error?: string;
  maxSide?: number;
  shape?: "wide" | "square";
  onChange?: () => void;
}) {
  const [key, setKey] = useState(initialKey);
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // The image that was just removed, so an accidental click can be undone before saving.
  const [removed, setRemoved] = useState<{ key: string; url: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setMessage(null);
    setBusy(true);
    try {
      const uploaded = await uploadImage(file, maxSide);
      setKey(uploaded.key);
      setUrl(uploaded.url);
      setRemoved(null);
      onChange?.();
    } catch (err) {
      setMessage(uploadErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const shownMessage = message ?? error ?? null;
  const square = shape === "square";

  return (
    <div>
      <input type="hidden" name={name} value={key} />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />

      <div className="flex flex-col items-start gap-4">
        {url ? (
          <Image
            src={url}
            alt=""
            width={square ? 400 : 1600}
            height={square ? 400 : 900}
            unoptimized
            className={
              square
                ? "h-40 w-40 rounded-2xl border border-line object-cover"
                : "h-auto max-h-64 w-full max-w-xl rounded-2xl border border-line object-cover"
            }
          />
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-panel/60 text-center text-muted transition-colors hover:border-brand/40 hover:bg-brand/5 disabled:opacity-60 ${
              square ? "h-40 w-40 shrink-0" : "w-full max-w-xl px-4 py-10"
            }`}
          >
            <Icon name="image" className="h-8 w-8" />
            <span className="text-sm font-semibold">{busy ? admin.uploader.uploading : admin.uploader.noImage}</span>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={button.secondary}>
            <Icon name="image" className="h-5 w-5" />
            {busy ? admin.uploader.uploading : url ? admin.uploader.change : admin.uploader.choose}
          </button>
          {url && !busy && (
            <button
              type="button"
              onClick={() => {
                setRemoved({ key, url });
                setKey("");
                setUrl(null);
                setMessage(null);
                onChange?.();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
            >
              <Icon name="trash" className="h-4 w-4" />
              {admin.uploader.remove}
            </button>
          )}
        </div>
      </div>

      {removed && !url && (
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span>{admin.uploader.removedNote}</span>
          <button
            type="button"
            onClick={() => {
              setKey(removed.key);
              setUrl(removed.url);
              setRemoved(null);
              onChange?.();
            }}
            className="font-bold text-brand underline-offset-4 hover:underline"
          >
            {admin.uploader.undo}
          </button>
        </p>
      )}

      {shownMessage && (
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-red-700">
          <Icon name="alert" className="h-4 w-4" />
          {shownMessage}
        </p>
      )}
    </div>
  );
}
