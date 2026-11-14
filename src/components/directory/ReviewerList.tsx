"use client";

import Link from "next/link";
import { useState } from "react";
import { directory } from "@/content/ta-LK";
import type { ReviewRowState } from "@/lib/directory/review-view";
import { Avatar } from "./PersonCard";
import { ArrowRightIcon, CheckIcon, PencilIcon, PinIcon, SearchIcon } from "./icons";

const ui = directory.review;

// One person on the reviewer's list, with only what this reviewer may see.
export type ReviewRowView = {
  id: number;
  name: string;
  place: string;
  art: string[];
  photoUrl: string | null;
  state: ReviewRowState;
};

export function StateBadge({ state }: { state: ReviewRowState }) {
  const look: Record<ReviewRowState, { className: string; label: string }> = {
    todo: { className: "bg-gold/25 text-amber-900", label: ui.badgeTodo },
    good: { className: "bg-green-100 text-green-800", label: ui.badgeGood },
    fix: { className: "bg-sky-100 text-sky-800", label: ui.badgeFix },
    decided: { className: "bg-panel text-muted", label: ui.badgeDecided },
  };
  const { className, label } = look[state];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${className}`}>
      {state === "good" && <CheckIcon className="h-3.5 w-3.5" />}
      {state === "fix" && <PencilIcon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

// The people this link was sent to: how far the reviewer is, two tabs (still to look at / done), a search by name, and one
// big tappable row for each person.
export function ReviewerList({ token, rows }: { token: string; rows: ReviewRowView[] }) {
  const todo = rows.filter((row) => row.state === "todo");
  const done = rows.length - todo.length;
  // Start where the work is: on what is left, or on what is done when nothing is left.
  const [tab, setTab] = useState<"todo" | "done">(todo.length > 0 ? "todo" : "done");
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const shown = rows.filter((row) => (tab === "todo" ? row.state === "todo" : row.state !== "todo") && (!needle || row.name.toLowerCase().includes(needle)));
  const percent = rows.length === 0 ? 0 : Math.round((done / rows.length) * 100);

  return (
    <div>
      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
        <p className="font-semibold text-ink">{ui.progress(done, rows.length)}</p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={rows.length}
          aria-valuenow={done}
          aria-label={ui.progress(done, rows.length)}
          className="mt-3 h-3 overflow-hidden rounded-full bg-sand"
        >
          <div className="h-full rounded-full bg-green-600 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6">
        <div role="tablist" className="flex flex-wrap gap-2">
          {(
            [
              { key: "todo", label: ui.tabTodo, count: todo.length },
              { key: "done", label: ui.tabDone, count: done },
            ] as const
          ).map((item) => {
            const selected = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.key)}
                // On a phone the number is a small gold badge on the corner of the tab (not beside the words), so both tabs fit in one row.
                className={`relative inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.85rem] font-semibold transition-colors focus-visible:ring-4 focus-visible:ring-gold sm:gap-2 sm:px-4 sm:text-base ${
                  selected ? "border-brand bg-brand text-white" : "border-line bg-white text-brand hover:bg-sand/60"
                }`}
              >
                {item.label}
                <span
                  className={`rounded-full px-2 text-xs font-bold max-sm:absolute max-sm:-right-1.5 max-sm:-top-2 max-sm:grid max-sm:h-5 max-sm:min-w-5 max-sm:place-items-center max-sm:bg-gold max-sm:px-1 max-sm:text-ink max-sm:shadow-sm ${
                    selected ? "bg-white/20" : "bg-panel text-muted"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {rows.length > 5 && (
          <label className="relative block min-w-0 flex-1 basis-56 sm:max-w-xs sm:flex-none sm:ml-auto">
            <span className="sr-only">{ui.search}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={ui.search}
              className="h-11 w-full rounded-full border border-line bg-white pl-4 pr-11 text-base text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
            <SearchIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
          </label>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="mt-4 rounded-3xl border border-dashed border-line bg-white/70 p-8 text-center text-muted">
          {needle ? ui.noMatch : tab === "todo" ? ui.emptyTodo : ui.emptyDone}
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5 sm:space-y-3">
          {shown.map((row) => (
            <li key={row.id}>
              <Link
                href={`/directory/review/${token}/${row.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-sm transition duration-200 hover:border-brand/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold motion-reduce:transition-none sm:gap-4 sm:rounded-3xl sm:p-5"
              >
                <Avatar name={row.name} photoUrl={row.photoUrl} size="h-12 w-12 sm:h-16 sm:w-16" text="text-lg sm:text-xl" border="border-2" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-base font-bold leading-snug text-ink [overflow-wrap:anywhere] group-hover:text-brand sm:text-lg">{row.name}</span>
                    <StateBadge state={row.state} />
                  </span>
                  {row.place && (
                    <span className="mt-1 flex items-start gap-1 text-[0.85rem] leading-snug text-muted [overflow-wrap:anywhere] sm:text-sm">
                      <PinIcon className="mt-[0.2rem] h-3.5 w-3.5 shrink-0 text-brand/60 sm:h-4 sm:w-4" />
                      {row.place}
                    </span>
                  )}
                  {row.art.length > 0 && (
                    <span className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-2">
                      {row.art.slice(0, 3).map((field) => (
                        <span key={field} className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-brand">
                          {field}
                        </span>
                      ))}
                      {row.art.length > 3 && <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-muted">+{row.art.length - 3}</span>}
                    </span>
                  )}
                </span>
                <ArrowRightIcon className="h-5 w-5 shrink-0 text-brand/50 transition-transform group-hover:translate-x-0.5 group-hover:text-brand motion-reduce:transition-none sm:h-6 sm:w-6" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
