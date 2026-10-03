"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { postText } from "@/content/ta-LK";

export function PhotoGallery({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const total = photos.length;

  function open(i: number) {
    setIndex(i);
    dialogRef.current?.showModal();
  }

  function step(delta: number) {
    setIndex((current) => (current === null ? current : (current + delta + total) % total));
  }

  useEffect(() => {
    if (index === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total]);

  if (total === 0) return null;

  const shown = photos.slice(0, 4);
  const extra = total - shown.length;
  const layout =
    total === 1 ? "grid-cols-1" : total === 2 ? "grid-cols-2" : "grid-cols-2";

  return (
    <>
      <ul className={`grid gap-1.5 overflow-hidden rounded-2xl ${layout}`}>
        {shown.map((url, i) => {
          const big = total === 3 && i === 0;
          const aspect = total === 1 ? "aspect-[16/10]" : "aspect-square";
          return (
            <li key={url} className={big ? "row-span-2" : ""}>
              <button
                type="button"
                onClick={() => open(i)}
                aria-label={`${postText.gallery.open} (${i + 1}/${total})`}
                className={`relative block w-full overflow-hidden bg-sand ${big ? "h-full min-h-full" : aspect}`}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  unoptimized
                  sizes="(min-width: 768px) 700px, 100vw"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
                {i === shown.length - 1 && extra > 0 && (
                  <span className="absolute inset-0 grid place-items-center bg-black/55 text-4xl font-bold text-white">
                    {postText.gallery.more(extra)}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto h-[100dvh] max-h-none w-screen max-w-none bg-black/95 p-0 text-white backdrop:bg-black"
        aria-label={postText.gallery.open}
      >
        {index !== null && (
          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between p-4">
              <p className="text-sm">{postText.gallery.count(index + 1, total)}</p>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="rounded-full border border-white/50 px-4 py-1.5 text-sm font-semibold hover:bg-white hover:text-black"
              >
                {postText.gallery.close}
              </button>
            </div>
            <div className="relative flex-1">
              <Image
                key={photos[index]}
                src={photos[index]}
                alt=""
                fill
                unoptimized
                sizes="100vw"
                className="object-contain"
              />
            </div>
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={postText.gallery.prev}
                  className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-2xl hover:bg-white/40"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={postText.gallery.next}
                  className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-2xl hover:bg-white/40"
                >
                  →
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
