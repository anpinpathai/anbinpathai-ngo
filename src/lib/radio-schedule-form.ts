import { admin } from "@/content/admin-en";
import { PROGRAMME_KINDS, type ProgrammeKind } from "@/db/schema";
import type { ProgrammeInput } from "@/lib/radio-schedule";
import { parseDate, toMinutes } from "@/lib/radio-schedule-format";

export type ProgrammeFormValues = {
  id: string;
  title: string;
  kind: string;
  date: string;
  weekday: string;
  startTime: string;
  endTime: string;
};

export type ProgrammeFormErrors = Partial<Record<keyof ProgrammeFormValues, string>>;

export function readProgrammeForm(formData: FormData): ProgrammeFormValues {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    id: text("id").trim(),
    title: text("title"),
    kind: text("kind"),
    date: text("date").trim(),
    weekday: text("weekday").trim(),
    startTime: text("startTime").trim(),
    endTime: text("endTime").trim(),
  };
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function isRealDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const { year, month, day } = parseDate(value);
  const check = new Date(Date.UTC(year, month - 1, day));
  return check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day;
}

export function validateProgramme(raw: ProgrammeFormValues) {
  const errors: ProgrammeFormErrors = {};
  const text = admin.radioSchedule.errors;

  const title = raw.title.trim();
  if (!title) errors.title = text.title;
  else if (title.length > 120) errors.title = admin.common.tooLong(120);

  const kind = PROGRAMME_KINDS.find((k) => k === raw.kind);
  if (!kind) errors.kind = text.kind;

  let onDate: string | null = null;
  let weekday: number | null = null;
  if (kind === "once") {
    if (isRealDate(raw.date)) onDate = raw.date;
    else errors.date = text.date;
  } else if (kind === "weekly") {
    const n = Number(raw.weekday);
    if (raw.weekday !== "" && Number.isInteger(n) && n >= 0 && n <= 6) weekday = n;
    else errors.weekday = text.weekday;
  }

  if (!TIME.test(raw.startTime)) errors.startTime = text.start;

  let endTime: string | null = null;
  if (raw.endTime) {
    if (!TIME.test(raw.endTime)) errors.endTime = text.end;
    else if (TIME.test(raw.startTime) && toMinutes(raw.endTime) <= toMinutes(raw.startTime)) errors.endTime = text.endAfterStart;
    else endTime = raw.endTime;
  }

  const values: ProgrammeFormValues = { ...raw, title };
  if (Object.keys(errors).length > 0 || !kind) return { values, errors, input: null };

  const input: ProgrammeInput = {
    title,
    kind: kind as ProgrammeKind,
    onDate,
    weekday,
    startTime: raw.startTime,
    endTime,
  };
  return { values, errors, input };
}
