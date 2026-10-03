"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { admin } from "@/content/admin-en";
import { readMemberForm, validateMember, type MemberFormErrors, type MemberFormValues } from "@/lib/member-form";
import { requireAdmin } from "@/lib/session";
import { deleteObjects } from "@/lib/storage";
import { createMember, deleteMember, getMember, moveMember, updateMember } from "@/lib/team";

export type MemberFormState = {
  status: "idle" | "saved" | "error";
  message?: string;
  values: MemberFormValues;
  errors: MemberFormErrors;
};

export async function saveMemberAction(_prev: MemberFormState, formData: FormData): Promise<MemberFormState> {
  await requireAdmin();

  const { values, errors, input } = validateMember(readMemberForm(formData));
  if (!input) return { status: "error", message: admin.common.fixErrors, values, errors };

  const id = values.id ? Number(values.id) : null;

  try {
    if (id) {
      const existing = await getMember(id);
      if (!existing || !(await updateMember(id, input, existing.roleGroup))) {
        return { status: "error", message: admin.team.errors.notFound, values, errors: {} };
      }
      if (existing.photoKey && existing.photoKey !== input.photoKey) await deleteObjects([existing.photoKey]);
    } else {
      await createMember(input);
    }
  } catch (err) {
    console.error("Saving member failed:", err);
    return { status: "error", message: admin.common.actionFailed, values, errors: {} };
  }

  revalidatePath("/", "layout");
  if (!id) redirect("/admin/team?notice=created");
  return { status: "saved", message: admin.team.form.saved, values, errors: {} };
}

export async function deleteMemberAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    const removed = await deleteMember(id);
    if (removed) await deleteObjects([removed.photoKey]);
    revalidatePath("/", "layout");
  }
  redirect("/admin/team?notice=deleted");
}

export async function moveMemberAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const direction = formData.get("direction") === "up" ? "up" : "down";
  if (Number.isInteger(id)) {
    await moveMember(id, direction);
    revalidatePath("/", "layout");
  }
  redirect("/admin/team");
}
