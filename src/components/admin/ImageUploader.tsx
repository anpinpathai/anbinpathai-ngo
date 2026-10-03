"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { admin } from "@/content/admin-en";
import { uploadErrorMessage, uploadImage } from "@/lib/upload-client";

const buttonClass =
  "rounded-full border-2 border-brand px-4 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white disabled:opacity-60";

export function ImageUploader({
  name,
  initialKey,
  initialUrl,
  error,
  maxSide = 1600,
  shape = "wide",
}: {
  name: string;
  initialKey: string;
  initialUrl: string | null;
  error?: string;
  maxSide?: number;
  shape?: "wide" | "square";
}) {
  const [key, setKey] = useState(initialKey);
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setMessage(null);
    setBusy(true);
    try {
      const uploaded = await uploadImage(file, maxSide);
      setKey(uploaded.key);
      setUrl(uploaded.url);
    } catch (err) {
      setMessage(uploadErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const shownMessage = message ?? error ?? null;

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

      {url ? (
        shape === "square" ? (
          <Image
            src={url}
            alt=""
            width={400}
            height={400}
            unoptimized
            className="mb-3 h-40 w-40 rounded-lg border border-line object-cover"
          />
        ) : (
          <Image
            src={url}
            alt=""
            width={1600}
            height={900}
            unoptimized
            className="mb-3 h-auto max-h-64 w-full max-w-lg rounded-lg border border-line object-cover"
          />
        )
      ) : (
        <p className="mb-3 text-sm text-muted">{admin.uploader.noImage}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={buttonClass}>
          {busy ? admin.uploader.uploading : url ? admin.uploader.change : admin.uploader.choose}
        </button>
        {url && !busy && (
          <button
            type="button"
            onClick={() => {
              setKey("");
              setUrl(null);
              setMessage(null);
            }}
            className="text-sm font-semibold text-red-700 underline-offset-4 hover:underline"
          >
            {admin.uploader.remove}
          </button>
        )}
      </div>

      {shownMessage && (
        <p role="alert" className="mt-2 text-sm font-semibold text-red-700">
          {shownMessage}
        </p>
      )}
    </div>
  );
}
