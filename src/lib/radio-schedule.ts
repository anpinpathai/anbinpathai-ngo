import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { radioProgrammes, type ProgrammeKind } from "@/db/schema";
import { nextDate, sortKey, statusOf, type ProgrammeStatus } from "@/lib/radio-schedule-format";

export type ProgrammeInput = {
  title: string;
  kind: ProgrammeKind;
  onDate: string | null;
  weekday: number | null;
  startTime: string;
  endTime: string | null;
};

export type Programme = typeof radioProgrammes.$inferSelect;

export async function getProgramme(id: number) {
  const [row] = await db.select().from(radioProgrammes).where(eq(radioProgrammes.id, id)).limit(1);
  return row ?? null;
}

export async function createProgramme(input: ProgrammeInput) {
  const [row] = await db.insert(radioProgrammes).values(input).returning({ id: radioProgrammes.id });
  return row.id;
}

export async function updateProgramme(id: number, input: ProgrammeInput) {
  const rows = await db.update(radioProgrammes).set(input).where(eq(radioProgrammes.id, id)).returning({ id: radioProgrammes.id });
  return rows.length > 0;
}

export async function deleteProgramme(id: number) {
  const rows = await db.delete(radioProgrammes).where(eq(radioProgrammes.id, id)).returning({ id: radioProgrammes.id });
  return rows.length > 0;
}

function listAll() {
  return db.select().from(radioProgrammes).orderBy(asc(radioProgrammes.startTime), asc(radioProgrammes.id));
}

export type AdminProgramme = Programme & { status: ProgrammeStatus; next: string | null };

// Everything, for the admin: weekly first, then dated ones soonest-first, then the past ones.
export async function listForAdmin(now: Date = new Date()) {
  const rows = await listAll();
  const withStatus: AdminProgramme[] = rows.map((p) => ({ ...p, status: statusOf(p, now), next: nextDate(p, now) }));
  const bySoonest = (a: AdminProgramme, b: AdminProgramme) =>
    sortKey(a.next ?? a.onDate ?? "", a.startTime).localeCompare(sortKey(b.next ?? b.onDate ?? "", b.startTime));
  return {
    weekly: withStatus.filter((p) => p.status === "weekly").sort(bySoonest),
    once: withStatus.filter((p) => p.status === "upcoming").sort(bySoonest),
    past: withStatus.filter((p) => p.status === "past").sort((a, b) => bySoonest(b, a)),
  };
}

export type SiteProgramme = Programme & { next: string };

// What visitors see: everything still to come, the soonest first. Past one-time programmes are left out.
export async function listForSite(now: Date = new Date()) {
  const rows = await listAll();
  return rows
    .map((p) => ({ ...p, next: nextDate(p, now) }))
    .filter((p): p is SiteProgramme => p.next !== null)
    .sort((a, b) => sortKey(a.next, a.startTime).localeCompare(sortKey(b.next, b.startTime)));
}
