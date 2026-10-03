"use client";

import { postText } from "@/content/ta-LK";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const text = postText.error;

  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl text-brand sm:text-4xl">{text.title}</h1>
      <p className="mt-4 text-lg text-muted">{text.text}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full bg-brand px-6 py-2.5 font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        {text.retry}
      </button>
    </main>
  );
}
