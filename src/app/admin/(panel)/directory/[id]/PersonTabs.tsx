"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";

export type PersonTabKey = "answers" | "reviewers" | "note" | "history";

// The parts of one person's page as tabs. All the parts are on the page at once and only one is shown, so switching is
// instant, and what was typed in the answers is still there when the admin comes back to that tab.
export function PersonTabs({
  tabs,
  initial,
  label,
  answers,
  reviewers,
  note,
  history,
}: {
  tabs: readonly { key: PersonTabKey; label: string; count?: number }[];
  initial: PersonTabKey;
  label: string;
  // The parts are given one by one (not as a list), so each one keeps its own place on the page.
  answers: ReactNode;
  reviewers: ReactNode;
  note: ReactNode;
  history: ReactNode;
}) {
  const [active, setActive] = useState<PersonTabKey>(initial);
  const panels: Record<PersonTabKey, ReactNode> = { answers, reviewers, note, history };

  // A tab the admin chose. The address follows it, so reloading the page (or sending the link) opens the same tab.
  // (Only for a real click: changing the address while the page is being refreshed by the server confuses the page.)
  function choose(key: PersonTabKey, moveFocus = false) {
    setActive(key);
    const url = new URL(window.location.href);
    if (key === "answers") url.searchParams.delete("tab");
    else url.searchParams.set("tab", key);
    window.history.replaceState(null, "", url);
    if (moveFocus) document.getElementById(`person-tab-${key}`)?.focus();
  }

  function onKeys(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((t) => t.key === active);
    let next = -1;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    choose(tabs[next].key, true);
  }

  return (
    <>
      <div role="tablist" aria-label={label} onKeyDown={onKeys} className="mb-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {tabs.map((tab) => {
          const selected = tab.key === active;
          return (
            <button
              key={tab.key}
              id={`person-tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`person-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(tab.key)}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2.5 py-2 text-center text-sm font-semibold leading-tight transition-colors focus-visible:ring-4 focus-visible:ring-gold sm:px-3.5 sm:text-base ${
                selected ? "border-brand bg-brand text-white shadow-sm" : "border-line bg-white text-ink hover:border-brand/40 hover:bg-sand/50"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${selected ? "bg-white/20 text-white" : "bg-gold/30 text-amber-900"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <section key={tab.key} id={`person-panel-${tab.key}`} role="tabpanel" aria-labelledby={`person-tab-${tab.key}`} hidden={tab.key !== active}>
          {panels[tab.key]}
        </section>
      ))}
    </>
  );
}
