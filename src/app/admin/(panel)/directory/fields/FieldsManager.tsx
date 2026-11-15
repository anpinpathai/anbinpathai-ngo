"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useRef, useState, useTransition, type KeyboardEvent, type ReactNode } from "react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/admin/Icon";
import { PageHeader } from "@/components/admin/PageHeader";
import { button, card, inputClass } from "@/components/admin/ui";
import { useToast } from "@/components/toast/ToastProvider";
import { directoryAdmin } from "@/content/admin-directory-en";
import { DIRECTORY_FIELD_TYPES, type DirectoryFieldType } from "@/db/schema";
import {
  ALWAYS_ON_KEYS,
  ALWAYS_PUBLIC_KEYS,
  SECTIONS,
  TYPE_LABEL_EN,
  type DirectoryFieldRow,
} from "@/lib/directory/config";
import { deleteFieldAction, moveFieldAction, saveFieldDetailsAction, setFieldFlagAction } from "./actions";
import { AddQuestionDialog } from "./AddQuestionDialog";
import { Switch, VisibilityPicker } from "./controls";

const text = directoryAdmin.fields;

type Patch = Partial<Pick<DirectoryFieldRow, "onForm" | "required" | "filterable" | "visibility">>;

const FILTER_TYPES: DirectoryFieldType[] = ["select", "multiselect", "text"];

// The same rules the server applies, so the screen answers at once and then agrees with the server.
function applyPatch(field: DirectoryFieldRow, patch: Patch): DirectoryFieldRow {
  const next = { ...field, ...patch };
  if ((ALWAYS_ON_KEYS as readonly string[]).includes(field.key)) {
    next.onForm = true;
    next.required = true;
  }
  if ((ALWAYS_PUBLIC_KEYS as readonly string[]).includes(field.key)) next.visibility = "public";
  if (!next.onForm) next.required = false;
  if (next.visibility !== "public") next.filterable = false;
  if (!FILTER_TYPES.includes(field.type)) next.filterable = false;
  return next;
}

// One setting of a question: a small heading with its control under it. Every control sits in a row of the same
// height, so the headings and the controls line up along a row, and the columns line up from one card to the next.
//
// On a phone a switch ("inline") is one row instead: the heading on the left and the switch on the right, which is
// shorter and an easy row to tap. A short note about the switch then goes under that row, not squeezed beside the switch.
function Setting({ label, note, inline = false, children }: { label: string; note?: string; inline?: boolean; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className={inline ? "flex items-center justify-between gap-3 max-sm:min-h-11 sm:block" : undefined}>
        <p className={`text-xs font-bold uppercase leading-4 tracking-wide text-muted ${inline ? "sm:mb-1.5" : "mb-1.5"}`}>{label}</p>
        <div className="flex h-9 items-center gap-2">
          {children}
          {note && <span className="hidden min-w-0 text-xs leading-tight text-muted sm:inline">{note}</span>}
        </div>
      </div>
      {note && <p className="-mt-1 mb-1 text-xs leading-tight text-muted sm:hidden">{note}</p>}
    </div>
  );
}

function Switches({ field, onPatch, busy }: { field: DirectoryFieldRow; onPatch: (patch: Patch) => void; busy: boolean }) {
  const always = (ALWAYS_ON_KEYS as readonly string[]).includes(field.key);
  const publicOnly = (ALWAYS_PUBLIC_KEYS as readonly string[]).includes(field.key);
  const canFilter = field.visibility === "public" && FILTER_TYPES.includes(field.type);

  // Two columns on a tablet, four fixed columns on a wide screen (fixed, so they line up in every card).
  return (
    <div className="mt-4 grid gap-x-8 gap-y-1 border-t border-line/70 pt-3 sm:grid-cols-2 sm:gap-y-4 sm:pt-4 xl:grid-cols-[9rem_7rem_minmax(0,1fr)_11.5rem]">
      <Setting label={text.onForm} note={always ? text.alwaysOn : undefined} inline>
        <Switch checked={field.onForm} onChange={(v) => onPatch({ onForm: v })} disabled={always || busy} label={`${text.onForm}: ${field.label}`} />
      </Setting>

      <Setting label={text.required} inline>
        <Switch checked={field.required} onChange={(v) => onPatch({ required: v })} disabled={always || !field.onForm || busy} label={`${text.required}: ${field.label}`} />
      </Setting>

      <Setting label={text.visibility}>
        <VisibilityPicker
          value={field.visibility}
          onChange={(v) => onPatch({ visibility: v })}
          label={`${text.visibility}: ${field.label}`}
          disabled={busy}
          onlyPublic={publicOnly}
        />
      </Setting>

      <Setting label={text.filter} note={!canFilter && field.visibility !== "public" ? text.filterNeedsPublic : undefined} inline>
        <Switch checked={field.filterable} onChange={(v) => onPatch({ filterable: v })} disabled={!canFilter || busy} label={`${text.filter}: ${field.label}`} />
      </Setting>
    </div>
  );
}

function EditPanel({
  field,
  onDone,
  onSectionChanged,
}: {
  field: DirectoryFieldRow;
  onDone: () => void;
  onSectionChanged: (section: string) => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [label, setLabel] = useState(field.label);
  const [help, setHelp] = useState(field.help);
  const [options, setOptions] = useState(field.options.join("\n"));
  const [type, setType] = useState<DirectoryFieldType>(field.type);
  const [section, setSection] = useState(field.section);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isList = type === "select" || type === "multiselect";
  const showOptions = isList && field.key !== "residence";

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveFieldDetailsAction(field.id, { label, help, options, type: field.builtin ? undefined : type, section: field.builtin ? undefined : section });
      if (!result.ok) {
        setError(result.error ?? text.saveFailed);
        return;
      }
      toast.success(text.saved);
      router.refresh();
      onDone();
      // A question moved to another group is followed there, so it does not seem to have disappeared.
      if (!field.builtin && section !== field.section) onSectionChanged(section);
    });
  }

  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-line bg-panel/60 p-4 sm:p-5">
      <label className="block">
        <span className="font-semibold text-ink">{text.label}</span>
        <input lang="ta" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={150} className={inputClass()} />
      </label>
      <label className="block">
        <span className="font-semibold text-ink">{text.help_}</span>
        <input lang="ta" value={help} onChange={(e) => setHelp(e.target.value)} maxLength={300} className={inputClass()} />
      </label>
      {!field.builtin && (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="font-semibold text-ink">{text.type}</span>
            <select value={type} onChange={(e) => setType(e.target.value as DirectoryFieldType)} className={`${inputClass()} select-arrow`}>
              {DIRECTORY_FIELD_TYPES.filter((t) => t !== "photo").map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABEL_EN[t]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-semibold text-ink">{text.section}</span>
            <select value={section} onChange={(e) => setSection(e.target.value)} className={`${inputClass()} select-arrow`}>
              {SECTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.en}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {showOptions && (
        <label className="block">
          <span className="font-semibold text-ink">{text.options}</span>
          <textarea lang="ta" value={options} onChange={(e) => setOptions(e.target.value)} rows={6} className={inputClass()} />
        </label>
      )}
      <div className="flex flex-wrap items-center justify-end gap-3">
        {error && (
          <p role="alert" className="mr-auto text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        <button type="button" onClick={onDone} className={button.ghost}>
          {text.close}
        </button>
        <button type="button" disabled={pending} onClick={save} className={button.primary}>
          {pending ? text.saving : text.save}
        </button>
      </div>
    </div>
  );
}

function FieldCard({
  field,
  index,
  total,
  onPatch,
  onMove,
  onSectionChanged,
  busy,
  fresh,
}: {
  field: DirectoryFieldRow;
  index: number;
  total: number;
  onPatch: (patch: Patch) => void;
  onMove: (direction: "up" | "down") => void;
  onSectionChanged: (section: string) => void;
  busy: boolean;
  fresh: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const item = useRef<HTMLLIElement>(null);

  // A question that was just added is brought into view and outlined for a moment, so it is easy to find.
  useEffect(() => {
    if (fresh) item.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [fresh]);

  return (
    <li
      ref={item}
      className={`${card} p-4 transition-shadow sm:p-5 ${field.onForm ? "" : "bg-panel/50"} ${fresh ? "ring-2 ring-gold ring-offset-2 ring-offset-sand" : ""}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1 basis-56">
          <p lang="ta" className={`text-lg font-semibold leading-snug [overflow-wrap:anywhere] ${field.onForm ? "text-ink" : "text-muted"}`}>
            {field.label}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span className="rounded-full bg-sand px-2 py-0.5 font-semibold">{TYPE_LABEL_EN[field.type]}</span>
            <span>{field.builtin ? text.builtin : text.custom}</span>
            {!field.onForm && <span className="rounded-full bg-gold/25 px-2 py-0.5 font-semibold text-amber-900">{text.hiddenFromForm}</span>}
          </p>
        </div>
        {/* All four buttons are the same height, so they sit in one straight line. */}
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className={button.icon} disabled={busy || index === 0} onClick={() => onMove("up")} aria-label={text.moveUp} title={text.moveUp}>
            <Icon name="arrowUp" className="h-4 w-4" />
          </button>
          <button type="button" className={button.icon} disabled={busy || index === total - 1} onClick={() => onMove("down")} aria-label={text.moveDown} title={text.moveDown}>
            <Icon name="arrowDown" className="h-4 w-4" />
          </button>
          <button type="button" className={`${button.small} h-9`} onClick={() => setEditing((v) => !v)} aria-expanded={editing}>
            <Icon name="edit" className="h-4 w-4" />
            {text.edit}
          </button>
          {!field.builtin && (
            <DeleteButton
              action={deleteFieldAction}
              id={field.id}
              label="Delete"
              title={text.deleteTitle}
              confirmMessage={text.deleteConfirm}
              size="icon"
            />
          )}
        </div>
      </div>

      <Switches field={field} onPatch={onPatch} busy={busy} />
      {editing && <EditPanel key={field.id} field={field} onDone={() => setEditing(false)} onSectionChanged={onSectionChanged} />}
    </li>
  );
}

export function FieldsManager({
  fields,
  initialTab,
  previewHref,
}: {
  fields: DirectoryFieldRow[];
  initialTab?: string;
  // The registration page, to look at the form as visitors see it (nothing when the registry is switched off).
  previewHref: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  // Only the question being changed is locked while the server answers, not the whole page.
  const [activeId, setActiveId] = useState<number | null>(null);
  const [shown, patchShown] = useOptimistic(fields, (current, update: { id: number; patch: Patch }) =>
    current.map((f) => (f.id === update.id ? applyPatch(f, update.patch) : f)),
  );
  const [adding, setAdding] = useState(false);
  const [fresh, setFresh] = useState<number | null>(null);

  // The groups that have at least one question, in the order of the registration form. Each one is a numbered tab.
  const groups = SECTIONS.map((section) => ({ ...section, fields: shown.filter((f) => f.section === section.key) })).filter(
    (group) => group.fields.length > 0,
  );

  const [tab, setTab] = useState(initialTab ?? "");
  const active = groups.some((g) => g.key === tab) ? tab : (groups[0]?.key ?? "");

  // On a phone the tabs scroll sideways; keep the open tab in view.
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    strip.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [active]);

  // The outline on a question that was just added goes away by itself.
  useEffect(() => {
    if (fresh === null) return;
    const timer = window.setTimeout(() => setFresh(null), 3200);
    return () => window.clearTimeout(timer);
  }, [fresh]);

  // A tab the person chose. The address follows it, so reloading the page (or sending the link) opens the same group.
  // (Only for a real click: changing the address right before a refresh of the list confuses the page.)
  function chooseTab(key: string, moveFocus = false) {
    setTab(key);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", key);
    window.history.replaceState(null, "", url);
    if (moveFocus) document.getElementById(`tab-${key}`)?.focus();
  }

  function onTabKeys(event: KeyboardEvent<HTMLDivElement>) {
    const index = groups.findIndex((g) => g.key === active);
    let next = -1;
    if (event.key === "ArrowRight") next = (index + 1) % groups.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + groups.length) % groups.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = groups.length - 1;
    if (next < 0) return;
    event.preventDefault();
    chooseTab(groups[next].key, true);
  }

  function patch(id: number, change: Patch) {
    setActiveId(id);
    startTransition(async () => {
      patchShown({ id, patch: change });
      const result = await setFieldFlagAction(id, change);
      if (!result.ok) toast.error(result.error ?? text.saveFailed);
      router.refresh();
    });
  }

  function move(id: number, direction: "up" | "down") {
    setActiveId(id);
    startTransition(async () => {
      await moveFieldAction(id, direction);
      router.refresh();
    });
  }

  return (
    <>
      {/* The buttons are at the right edge of the heading. On a phone "Add" takes the row and "Preview" is a square icon beside it. */}
      <PageHeader
        title={text.title}
        icon="layout"
        stackActions
        actions={
          <>
            {previewHref && (
              <Link
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={text.preview}
                title={text.preview}
                className={`${button.secondary} max-sm:w-12 max-sm:shrink-0 max-sm:!px-0`}
              >
                <Icon name="externalLink" className="h-5 w-5" />
                <span className="max-sm:sr-only">{text.preview}</span>
              </Link>
            )}
            <button type="button" onClick={() => setAdding(true)} className={`${button.gold} border border-transparent max-sm:order-first max-sm:min-w-0 max-sm:flex-1`}>
              <Icon name="plus" className="h-5 w-5" />
              {text.addButton}
            </button>
          </>
        }
      />

      {/* One strip on a phone (it scrolls sideways); a neat grid from a tablet up, so the edges line up. */}
      <div
        ref={strip}
        role="tablist"
        aria-label={text.groupsLabel}
        onKeyDown={onTabKeys}
        className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:mb-5 md:grid md:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {groups.map((group, index) => {
          const selected = group.key === active;
          return (
            <button
              key={group.key}
              id={`tab-${group.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${group.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => chooseTab(group.key)}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:ring-4 focus-visible:ring-gold md:min-h-[3.9rem] md:shrink ${
                selected ? "border-brand bg-brand text-white shadow-sm" : "border-line bg-white text-ink hover:border-brand/40 hover:bg-sand/50"
              }`}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${selected ? "bg-gold text-ink" : "bg-brand/10 text-brand"}`}>
                {index + 1}
              </span>
              <span className="font-semibold leading-tight max-md:whitespace-nowrap md:min-w-0 md:flex-1">{group.en}</span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${selected ? "bg-white/20 text-white" : "bg-sand text-muted"}`}>{group.fields.length}</span>
            </button>
          );
        })}
      </div>

      {groups.map((group) => (
        <section key={group.key} id={`panel-${group.key}`} role="tabpanel" aria-labelledby={`tab-${group.key}`} hidden={group.key !== active}>
          <h2 className="sr-only">
            {group.en} <span lang="ta">{group.ta}</span>
          </h2>
          <ul className="space-y-3">
            {group.fields.map((field, index) => (
              <FieldCard
                key={field.id}
                field={field}
                index={index}
                total={group.fields.length}
                busy={isPending && activeId === field.id}
                fresh={field.id === fresh}
                onPatch={(change) => patch(field.id, change)}
                onMove={(direction) => move(field.id, direction)}
                onSectionChanged={(section) => setTab(section)}
              />
            ))}
          </ul>
        </section>
      ))}

      {adding && (
        <AddQuestionDialog
          defaultSection={active}
          onClose={() => setAdding(false)}
          onCreated={(section, id) => {
            // Show the group the new question went to, and point at the question.
            setAdding(false);
            setTab(section);
            setFresh(id);
          }}
        />
      )}
    </>
  );
}
