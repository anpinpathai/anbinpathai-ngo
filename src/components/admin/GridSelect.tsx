"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "./Icon";

// With more choices than this, a small search box appears at the top of the panel.
const SEARCH_FROM = 30;
// The panel is never wider than this (in pixels); on a small screen it is as wide as the card it sits in.
const PANEL_MAX = 800;

// How many columns the choices get: more when the panel is wide, so the whole list is short.
function columnsFor(width: number) {
  return width >= 700 ? 4 : width >= 440 ? 3 : 2;
}

// Tamil text normally gets a tall line height from the site's own style; the choices need it tighter so the panel stays short.
// With only two columns (a phone) the text is a little smaller, so the long words do not break in the middle.
const TIGHT = { lineHeight: 1.35 } as const;
const TIGHT_SMALL = { lineHeight: 1.35, fontSize: "0.8rem" } as const;

// Where the panel goes: as wide as it can be (up to PANEL_MAX), with its right edge in line with the box, but never
// outside the card (the group of questions, or the form) the box is in. The numbers are relative to the box's wrapper.
function placeFor(wrapper: HTMLElement) {
  const card = (wrapper.closest("fieldset, form") ?? wrapper.parentElement ?? wrapper).getBoundingClientRect();
  const me = wrapper.getBoundingClientRect();
  const width = Math.min(card.width, PANEL_MAX);
  const left = Math.min(Math.max(me.right - width, card.left), card.right - width) - me.left;
  return { left, width };
}

function optionClass(selected: boolean) {
  return `flex min-h-9 w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
    selected ? "border-brand/40 bg-brand/10 font-semibold text-brand" : "border-transparent text-ink hover:bg-sand/60"
  }`;
}

// A drop-down list for a long list of choices. The box looks like the other boxes; pressing it opens a neat panel with
// all the choices in columns (no long scrolling list). It sends its choice with the form, like a normal <select>.
export function GridSelect({
  id,
  name,
  options,
  value: initial = "",
  onChange,
  labelId,
  anyLabel,
  allLabel,
  searchLabel,
  noMatch,
  className,
}: {
  // The id of the box, so a label can point at it.
  id?: string;
  // The name it is sent under. Leave it out when the page sends the choice itself.
  name?: string;
  options: readonly string[];
  // The choice to start with ("" means none). When the page gives a new value, the box follows it.
  value?: string;
  // Called with the new choice when the person picks one.
  onChange?: (value: string) => void;
  // The id of the visible caption above the box, so screen readers say what the box is for.
  labelId: string;
  // Shown in the box while nothing is chosen.
  anyLabel: string;
  // The first row of the panel, which clears the choice. Leave it out when a choice is needed.
  allLabel?: string;
  searchLabel: string;
  noMatch: string;
  // The look of the box, the same as the other boxes (it can show an error with a red border).
  className: string;
}) {
  // When the page gives a new value (for example after "Clear"), follow it.
  const [value, setValue] = useState(initial);
  const [seen, setSeen] = useState(initial);
  if (initial !== seen) {
    setSeen(initial);
    setValue(initial);
  }

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState<{ left: number; width: number } | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const listId = useId();
  const valueId = useId();

  const hasAll = allLabel !== undefined;
  const searchable = options.length > SEARCH_FROM;
  const columns = place ? columnsFor(place.width) : 2;
  const needle = query.trim().toLowerCase();
  const shown = needle ? options.filter((o) => o.toLowerCase().includes(needle)) : options;

  function openPanel() {
    if (wrapper.current) setPlace(placeFor(wrapper.current));
    setOpen(true);
  }

  function closePanel(returnFocus: boolean) {
    setOpen(false);
    setQuery("");
    if (returnFocus) box.current?.focus();
  }

  function choose(next: string) {
    if (next !== value) {
      setValue(next);
      onChange?.(next);
      // Tell the form that something changed, the way a normal box does (the form's "unsaved changes" notice listens for it).
      box.current?.dispatchEvent(new Event("input", { bubbles: true }));
    }
    closePanel(true);
  }

  // While it is open: a press outside closes it, and it follows the card when the window changes size.
  useEffect(() => {
    if (!open) return;
    function away(event: PointerEvent) {
      if (wrapper.current && !wrapper.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function resize() {
      if (wrapper.current) setPlace(placeFor(wrapper.current));
    }
    document.addEventListener("pointerdown", away);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", away);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  // When it opens, the keyboard goes into it: the search box if there is one, otherwise the current choice.
  useEffect(() => {
    if (!open) return;
    const target =
      panel.current?.querySelector<HTMLElement>(searchable ? "input" : '[aria-selected="true"]') ?? panel.current?.querySelector<HTMLElement>('[role="option"]');
    target?.focus({ preventScroll: true });
    // On a short screen, bring the whole panel into view (a jump, not a glide, so it does not fight the click).
    panel.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [open, searchable]);

  function onPanelKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closePanel(true);
      return;
    }
    if (event.key === "Tab") {
      // Let the focus move on, and close behind it.
      setOpen(false);
      setQuery("");
      return;
    }
    if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    // In the search box, left, right, Home and End move the text cursor.
    if (event.target instanceof HTMLInputElement && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    const items = [...(panel.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];
    if (items.length === 0) return;
    const at = items.indexOf(document.activeElement as HTMLElement);
    const last = items.length - 1;
    // With an "all" row, it is the first item and the rest sit in rows of `columns` below it. Up and down move a whole row.
    let next = at;
    if (event.key === "ArrowRight") next = at < 0 ? 0 : Math.min(at + 1, last);
    else if (event.key === "ArrowLeft") next = Math.max(at - 1, 0);
    else if (event.key === "ArrowDown") next = at < 0 ? 0 : hasAll && at === 0 ? Math.min(1, last) : Math.min(at + columns, last);
    else if (event.key === "ArrowUp") next = hasAll ? (at <= columns ? 0 : at - columns) : at < columns ? Math.max(at, 0) : at - columns;
    else if (event.key === "Home") next = 0;
    else next = last;
    event.preventDefault();
    items[next]?.focus();
  }

  return (
    <div ref={wrapper} className="relative">
      <button
        ref={box}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${labelId} ${valueId}`}
        onClick={() => (open ? closePanel(false) : openPanel())}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            openPanel();
          }
        }}
        className={`${className} block text-left`}
      >
        <span id={valueId} lang={value ? "ta" : undefined} style={{ lineHeight: 1.5 }} className="block truncate">
          {value || anyLabel}
        </span>
      </button>
      {name && <input type="hidden" name={name} value={value} />}

      {open && place && (
        <div
          ref={panel}
          onKeyDown={onPanelKeys}
          style={{ left: place.left, width: place.width }}
          className="absolute top-full z-30 mt-2 rounded-2xl border border-line bg-white p-3 shadow-[0_16px_40px_-12px_rgba(26,5,64,0.35)]"
        >
          {searchable && (
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                // Enter picks the first match. It must not send the form, or jump to the next question.
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.stopPropagation();
                  if (shown[0]) choose(shown[0]);
                }
              }}
              placeholder={searchLabel}
              aria-label={searchLabel}
              lang="ta"
              className="mb-2 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
            />
          )}

          <div id={listId} role="listbox" aria-labelledby={labelId} className="max-h-[min(28rem,65vh)] overflow-y-auto">
            {hasAll && (
              <button
                type="button"
                role="option"
                aria-selected={value === ""}
                tabIndex={value === "" ? 0 : -1}
                onClick={() => choose("")}
                className={`${optionClass(value === "")} mb-1`}
              >
                <span>{allLabel}</span>
                {value === "" && <Icon name="check" className="h-4 w-4 shrink-0" />}
              </button>
            )}

            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {shown.map((option) => {
                const selected = option === value;
                return (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    lang="ta"
                    style={columns === 2 ? TIGHT_SMALL : TIGHT}
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => choose(option)}
                    className={optionClass(selected)}
                  >
                    <span className="min-w-0 [overflow-wrap:anywhere]">{option}</span>
                    {selected && <Icon name="check" className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {shown.length === 0 && <p className="px-2 py-3 text-sm text-muted">{noMatch}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
