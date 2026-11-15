"use client";

import { useEffect, useRef } from "react";

// Put this inside a row of tabs that scrolls sideways (on a phone): when the page opens, the tab that is on
// (aria-current="page") is brought into view, so the person never has to hunt for it. It draws nothing.
export function ScrollToActive() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // "nearest" on the up-down side, so the page itself never jumps.
    marker.current?.parentElement?.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({ inline: "center", block: "nearest", behavior: "instant" });
  }, []);

  return <span ref={marker} hidden />;
}
