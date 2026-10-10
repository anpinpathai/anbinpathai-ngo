"use client";

import { radio } from "@/content/ta-LK";
import { Equalizer, PlayIcon, SpinnerIcon, StopIcon } from "./icons";
import { useRadio } from "./RadioProvider";

// The big play button with its status line. Made for a dark background.
export function RadioPlayer() {
  const { status, nowPlaying, toggle } = useRadio();
  const canPlay = status === "idle" || status === "error";

  const message =
    status === "error"
      ? radio.error
      : status === "loading"
        ? radio.loading
        : status === "playing"
          ? nowPlaying
            ? `${radio.nowPlaying}: ${nowPlaying}`
            : radio.live
          : radio.listen;

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={toggle}
        aria-label={canPlay ? radio.play : radio.stop}
        className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gold text-ink shadow-lg transition hover:scale-105 hover:bg-white sm:h-24 sm:w-24"
      >
        {status === "loading" ? <SpinnerIcon /> : canPlay ? <PlayIcon className="ml-1 h-9 w-9" /> : <StopIcon />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2.5 text-sm font-semibold text-gold">
          <Equalizer active={status === "playing"} />
          {radio.live}
        </p>
        <p aria-live="polite" className="mt-1 text-base font-semibold leading-snug text-white [overflow-wrap:anywhere] sm:text-lg">
          {message}
        </p>
      </div>
    </div>
  );
}
