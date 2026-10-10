"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { postText } from "@/content/ta-LK";
import { categoryColor } from "@/lib/category-colors";
import type { LatestTab } from "@/lib/post-types";
import { PostCard } from "./PostCard";

// A little smaller on a phone so "view all" has room beside the arrows; the "sm:" classes are the larger size.
const arrowButton =
  "grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-brand bg-white text-lg font-bold text-brand transition-colors hover:bg-brand hover:text-white disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-brand sm:h-11 sm:w-11 sm:text-xl";

export function LatestUpdates({ tabs }: { tabs: LatestTab[] }) {
  const [active, setActive] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [edges, setEdges] = useState({ start: true, end: false });
  const rowRef = useRef<HTMLUListElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const hoverRef = useRef(false);
  const lastTouchRef = useRef(0);

  const tab = tabs[active];
  const color = categoryColor[tab.colorKey];

  const updateEdges = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [active, updateEdges]);

  useEffect(() => {
    if (!autoPlay) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      const el = rowRef.current;
      if (!el || document.hidden || hoverRef.current || Date.now() - lastTouchRef.current < 8000) return;
      if (el.scrollWidth <= el.clientWidth + 4) return;

      const step = (el.querySelector("li")?.clientWidth ?? 300) + 16;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step, behavior: "smooth" });
    }, 5000);

    return () => window.clearInterval(id);
  }, [autoPlay, active]);

  function selectTab(index: number) {
    setActive(index);
    requestAnimationFrame(() => {
      rowRef.current?.scrollTo({ left: 0 });
      updateEdges();
    });
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    const next =
      event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    selectTab(next);
    tabRefs.current[next]?.focus();
  }

  function scrollRow(direction: -1 | 1) {
    const el = rowRef.current;
    if (!el) return;
    lastTouchRef.current = Date.now();
    const step = (el.querySelector("li")?.clientWidth ?? 300) + 16;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <section aria-labelledby="latest-title" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="latest-title" className="text-xl text-brand sm:text-3xl">
          {postText.latestTitle}
        </h2>
        <button
          type="button"
          aria-pressed={autoPlay}
          onClick={() => setAutoPlay((v) => !v)}
          className="-my-2 py-2 text-sm font-semibold text-muted underline-offset-4 hover:text-brand hover:underline"
        >
          {autoPlay ? postText.pause : postText.play}
        </button>
      </div>

      {/* One row that scrolls sideways on phones; on a computer the five names fit, and wrap if the window is narrow. */}
      <div
        role="tablist"
        aria-label={postText.tabsLabel}
        className="mt-6 flex gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible"
      >
        {tabs.map((tb, index) => {
          const c = categoryColor[tb.colorKey];
          const selected = index === active;
          return (
            <button
              key={tb.slug}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={`latest-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="latest-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => selectTab(index)}
              onKeyDown={(e) => onTabKeyDown(e, index)}
              className={`whitespace-nowrap rounded-full border-2 px-3 py-2 text-[0.9rem] font-semibold transition-colors ${
                selected ? `${c.solid} ${c.border}` : `border-line bg-white ${c.text} hover:bg-sand`
              }`}
            >
              {tb.name}
            </button>
          );
        })}
      </div>

      <div
        id="latest-panel"
        role="tabpanel"
        aria-labelledby={`latest-tab-${active}`}
        className={`mt-4 rounded-2xl p-4 sm:p-6 ${color.tint}`}
      >
        {tab.posts.length === 0 ? (
          <p className="py-10 text-center text-muted">{postText.empty}</p>
        ) : (
          <>
            <ul
              ref={rowRef}
              onScroll={updateEdges}
              onPointerEnter={() => (hoverRef.current = true)}
              onPointerLeave={() => (hoverRef.current = false)}
              onTouchStart={() => (lastTouchRef.current = Date.now())}
              onWheel={() => (lastTouchRef.current = Date.now())}
              onFocusCapture={() => (lastTouchRef.current = Date.now())}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]"
            >
              {tab.posts.map((post) => (
                <li key={post.id} className="w-72 shrink-0 snap-start sm:w-80">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>

            {/* One line on every screen: the arrows on the left and "view all" on the right. On a phone the link
                is smaller, right-aligned, and may take two lines inside the space beside the arrows. */}
            <div className="mt-3 flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  aria-label={postText.scrollPrev}
                  title={postText.scrollPrev}
                  disabled={edges.start}
                  onClick={() => scrollRow(-1)}
                  className={arrowButton}
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label={postText.scrollNext}
                  title={postText.scrollNext}
                  disabled={edges.end}
                  onClick={() => scrollRow(1)}
                  className={arrowButton}
                >
                  →
                </button>
              </div>
              <Link
                href={tab.href}
                className={`min-w-0 text-right text-[0.78rem] font-semibold leading-snug underline-offset-4 hover:underline max-[374px]:text-[0.7rem] sm:text-base sm:leading-normal ${color.text}`}
              >
                {postText.viewAll} →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
