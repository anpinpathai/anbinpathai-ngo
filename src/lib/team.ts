import "server-only";
import { asc, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { teamMembers, type RoleGroup } from "@/db/schema";

export type MemberInput = {
  name: string;
  roleTitle: string;
  roleGroup: RoleGroup;
  subtitle: string | null;
  photoKey: string | null;
};

export function listMembers() {
  return db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder), asc(teamMembers.id));
}

export async function getMember(id: number) {
  const [row] = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  return row ?? null;
}

async function nextSortOrder() {
  const [row] = await db.select({ top: max(teamMembers.sortOrder) }).from(teamMembers);
  return (row?.top ?? 0) + 1;
}

export async function createMember(input: MemberInput) {
  const [row] = await db
    .insert(teamMembers)
    .values({ ...input, sortOrder: await nextSortOrder() })
    .returning({ id: teamMembers.id });
  return row.id;
}

export async function updateMember(id: number, input: MemberInput, previousGroup: RoleGroup) {
  const sortOrder = input.roleGroup === previousGroup ? undefined : await nextSortOrder();
  const rows = await db
    .update(teamMembers)
    .set({ ...input, ...(sortOrder === undefined ? {} : { sortOrder }) })
    .where(eq(teamMembers.id, id))
    .returning({ id: teamMembers.id });
  return rows.length > 0;
}

export async function deleteMember(id: number) {
  const [row] = await db.delete(teamMembers).where(eq(teamMembers.id, id)).returning({ photoKey: teamMembers.photoKey });
  return row ?? null;
}

export async function moveMember(id: number, direction: "up" | "down") {
  const all = await listMembers();
  const member = all.find((m) => m.id === id);
  if (!member) return;

  const group = all.filter((m) => m.roleGroup === member.roleGroup);
  const index = group.findIndex((m) => m.id === id);
  const other = group[direction === "up" ? index - 1 : index + 1];
  if (!other) return;

  await db.batch([
    db.update(teamMembers).set({ sortOrder: other.sortOrder }).where(eq(teamMembers.id, member.id)),
    db.update(teamMembers).set({ sortOrder: member.sortOrder }).where(eq(teamMembers.id, other.id)),
  ]);
}
