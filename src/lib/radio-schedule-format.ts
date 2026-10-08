// Shared by the Radio page and the admin form, so the staff preview matches what visitors see.
// All times are Sri Lanka time (UTC+5:30, no daylight saving), written "HH:MM" in 24 hours.
import { months, radio } from "@/content/ta-LK";

const text = radio.schedule;

// A programme with no end time stays on the website for this long after it starts.
const DEFAULT_LENGTH_MINUTES = 120;
const SRI_LANKA_OFFSET_MINUTES = 330;

export type ProgrammeTiming = {
  kind: "once" | "weekly";
  onDate: string | null; // YYYY-MM-DD
  weekday: number | null; // 0 = Sunday ... 6 = Saturday
  startTime: string;
  endTime: string | null;
};

export function sriLankaNow(now: Date = new Date()) {
  const shifted = new Date(now.getTime() + SRI_LANKA_OFFSET_MINUTES * 60_000);
  return {
    date: shifted.toISOString().slice(0, 10),
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
    weekday: shifted.getUTCDay(),
  };
}

export function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function parseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day, weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay() };
}

function addDays(date: string, days: number) {
  const { year, month, day } = parseDate(date);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function partOfDay(minutes: number) {
  const p = text.parts;
  if (minutes < 4 * 60) return p.night;
  if (minutes < 12 * 60) return p.morning;
  if (minutes < 13 * 60) return p.noon;
  if (minutes < 16 * 60) return p.afternoon;
  if (minutes < 19 * 60) return p.evening;
  return p.night;
}

function clock(minutes: number) {
  const hour = Math.floor(minutes / 60) % 12 || 12;
  return `${hour}:${String(minutes % 60).padStart(2, "0")}`;
}

// "இரவு 7:00 மணி" or, with an end time, "இரவு 7:00 – 8:00 மணி" (the part of the day is repeated only if it changes).
export function timeTextTa(startTime: string, endTime: string | null) {
  const start = toMinutes(startTime);
  if (!endTime) return `${partOfDay(start)} ${clock(start)} ${text.hour}`;
  const end = toMinutes(endTime);
  const samePart = partOfDay(start) === partOfDay(end);
  return `${partOfDay(start)} ${clock(start)} – ${samePart ? "" : `${partOfDay(end)} `}${clock(end)} ${text.hour}`;
}

export const weekdayShortTa = (weekday: number) => text.weekdaysShort[weekday] ?? "";
export const weekdayLongTa = (weekday: number) => text.weekdaysLong[weekday] ?? "";

// The next date this programme happens on, or null if a one-time programme is already over.
export function nextDate(p: ProgrammeTiming, now: Date = new Date()): string | null {
  const today = sriLankaNow(now);
  const end = p.endTime ? toMinutes(p.endTime) : toMinutes(p.startTime) + DEFAULT_LENGTH_MINUTES;

  if (p.kind === "once") {
    if (!p.onDate) return null;
    return p.onDate > today.date || (p.onDate === today.date && end > today.minutes) ? p.onDate : null;
  }

  if (p.weekday === null) return null;
  let ahead = (p.weekday - today.weekday + 7) % 7;
  if (ahead === 0 && end <= today.minutes) ahead = 7;
  return addDays(today.date, ahead);
}

// What the staff screens show: the whole schedule on one line, in Tamil, exactly as visitors read it.
export function scheduleLineTa(p: ProgrammeTiming) {
  const time = timeTextTa(p.startTime, p.endTime);
  if (p.kind === "weekly") return `${text.everyWeek(weekdayLongTa(p.weekday ?? 0))} · ${time}`;
  if (!p.onDate) return time;
  const d = parseDate(p.onDate);
  return `${weekdayShortTa(d.weekday)} · ${d.day} ${months[d.month - 1]} ${d.year} · ${time}`;
}

// What one row on the Radio page shows.
export function rowParts(p: ProgrammeTiming, date: string) {
  const d = parseDate(date);
  const time = timeTextTa(p.startTime, p.endTime);
  return {
    day: d.day,
    month: months[d.month - 1],
    weekdayShort: weekdayShortTa(d.weekday),
    line:
      p.kind === "weekly"
        ? `${text.everyWeek(weekdayLongTa(d.weekday))} · ${time}`
        : `${weekdayShortTa(d.weekday)} · ${time}`,
  };
}

export type ProgrammeStatus = "weekly" | "upcoming" | "past";

export function statusOf(p: ProgrammeTiming, now: Date = new Date()): ProgrammeStatus {
  if (p.kind === "weekly") return "weekly";
  return nextDate(p, now) ? "upcoming" : "past";
}

export const sortKey = (date: string, startTime: string) => `${date}T${startTime}`;
