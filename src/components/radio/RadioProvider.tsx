"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { radio } from "@/content/ta-LK";
import { CloseIcon, Equalizer, PlayIcon, SpinnerIcon, StopIcon } from "./icons";

export type RadioStatus = "idle" | "loading" | "playing" | "error";

type RadioState = {
  status: RadioStatus;
  nowPlaying: string | null;
  toggle: () => void;
  stop: () => void;
};

const RadioContext = createContext<RadioState | null>(null);

export function useRadio() {
  const value = useContext(RadioContext);
  if (!value) throw new Error("useRadio must be used inside <RadioProvider>");
  return value;
}

const POLL_MS = 20_000;

// AzuraCast answers with { now_playing: { song: { text, artist, title } } }. Anything else is ignored.
function parseNowPlaying(data: unknown): string | null {
  const song = (data as { now_playing?: { song?: Record<string, unknown> } } | null)?.now_playing?.song;
  if (!song) return null;
  const text = typeof song.text === "string" ? song.text : [song.artist, song.title].filter((v) => typeof v === "string" && v).join(" - ");
  const clean = text.trim().slice(0, 160);
  return clean || null;
}

export function RadioProvider({
  streamUrl,
  nowPlayingUrl,
  children,
}: {
  streamUrl: string;
  nowPlayingUrl: string | null;
  children: ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const pathname = usePathname();
  const [status, setStatus] = useState<RadioStatus>("idle");
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);

  // Stopping also lets go of the stream, so a live radio costs no data while stopped and starts live again.
  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setStatus("idle");
    setNowPlaying(null);
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setStatus("loading");
    audio.src = streamUrl;
    audio.play().catch((err: unknown) => {
      // Pressing stop while it was still loading is not an error.
      if ((err as { name?: string })?.name !== "AbortError") setStatus("error");
    });
  }, [streamUrl]);

  const toggle = useCallback(() => {
    if (status === "idle" || status === "error") play();
    else stop();
  }, [status, play, stop]);

  const listening = status === "playing" || status === "loading";

  // While listening, ask the radio server which song is playing, now and then.
  useEffect(() => {
    if (!nowPlayingUrl || !listening) return;
    const controller = new AbortController();

    async function load() {
      try {
        const res = await fetch(nowPlayingUrl!, { signal: controller.signal });
        if (res.ok) setNowPlaying(parseNowPlaying(await res.json()));
      } catch {
        // No song name is fine. The radio still plays.
      }
    }

    void load();
    const timer = window.setInterval(load, POLL_MS);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [nowPlayingUrl, listening]);

  // Phone lock screen and keyboard media keys.
  useEffect(() => {
    if (status !== "playing" || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    session.metadata = new MediaMetadata({
      title: nowPlaying ?? radio.name,
      artist: radio.name,
      artwork: [{ src: "/logos/logo-mandram.webp" }],
    });
    session.setActionHandler("pause", stop);
    session.setActionHandler("stop", stop);
    return () => {
      session.setActionHandler("pause", null);
      session.setActionHandler("stop", null);
      session.metadata = null;
    };
  }, [status, nowPlaying, stop]);

  const value = useMemo(() => ({ status, nowPlaying, toggle, stop }), [status, nowPlaying, toggle, stop]);

  // The small bar follows visitors from page to page. The Radio page has its own big player.
  const showBar = status !== "idle" && pathname !== radio.href;
  const retry = status === "error";

  return (
    <RadioContext.Provider value={value}>
      {children}

      <audio
        ref={audioRef}
        preload="none"
        onPlaying={() => setStatus("playing")}
        onWaiting={() => setStatus((s) => (s === "playing" ? "loading" : s))}
        onEnded={() => setStatus("error")}
        onError={() => {
          // Taking the source away on purpose (stop) also raises this event. Only a real failure counts.
          if (audioRef.current?.getAttribute("src")) setStatus("error");
        }}
        onPause={() => {
          // Headphone buttons or the phone's own controls paused it: treat that as stop.
          // A stream that failed to load also pauses, but that is an error, not the visitor pausing.
          const audio = audioRef.current;
          if (audio?.getAttribute("src") && !audio.error) stop();
        }}
      />

      {showBar && (
        <>
          <div aria-hidden="true" className="h-[4.5rem]" />
          <div
            role="region"
            aria-label={radio.name}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-brand-dark text-white shadow-[0_-8px_24px_rgba(0,0,0,0.25)]"
          >
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
              <button
                type="button"
                onClick={toggle}
                aria-label={retry ? radio.retry : radio.stop}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-ink transition-colors hover:bg-white"
              >
                {status === "loading" ? (
                  <SpinnerIcon className="h-5 w-5" />
                ) : retry ? (
                  <PlayIcon className="h-5 w-5" />
                ) : (
                  <StopIcon className="h-5 w-5" />
                )}
              </button>
              <Link href={radio.href} className="min-w-0 flex-1 leading-snug hover:underline">
                <span className="block truncate text-sm font-semibold text-gold">{radio.name}</span>
                <span className="block truncate text-sm text-white/85">
                  {retry ? radio.error : status === "loading" ? radio.loading : (nowPlaying ?? radio.live)}
                </span>
              </Link>
              <Equalizer active={status === "playing"} className="hidden sm:flex" />
              <button
                type="button"
                onClick={stop}
                aria-label={radio.close}
                title={radio.close}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        </>
      )}
    </RadioContext.Provider>
  );
}
