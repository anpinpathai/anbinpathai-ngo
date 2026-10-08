"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { admin } from "@/content/admin-en";
import { createProgramme, deleteProgramme, updateProgramme } from "@/lib/radio-schedule";
import { readProgrammeForm, validateProgramme, type ProgrammeFormErrors, type ProgrammeFormValues } from "@/lib/radio-schedule-form";
import { requireAdmin } from "@/lib/session";

export type ProgrammeFormState = {
  status: "idle" | "saved" | "error";
  message?: string;
  values: ProgrammeFormValues;
  errors: ProgrammeFormErrors;
};

export async function saveProgrammeAction(_prev: ProgrammeFormState, formData: FormData): Promise<ProgrammeFormState> {
  await requireAdmin();

  const { values, errors, input } = validateProgramme(readProgrammeForm(formData));
  if (!input) return { status: "error", message: admin.common.fixErrors, values, errors };

  const id = values.id ? Number(values.id) : null;

  try {
    if (id) {
      if (!(await updateProgramme(id, input))) {
        return { status: "error", message: admin.radioSchedule.errors.notFound, values, errors: {} };
      }
    } else {
      await createProgramme(input);
    }
  } catch (err) {
    console.error("Saving programme failed:", err);
    return { status: "error", message: admin.common.actionFailed, values, errors: {} };
  }

  // Refresh every saved public page, so the Radio page shows the change at once.
  revalidatePath("/", "layout");
  if (!id) redirect("/admin/radio-schedule?notice=created");
  return { status: "saved", message: admin.radioSchedule.form.saved, values, errors: {} };
}

export async function deleteProgrammeAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    await deleteProgramme(id);
    revalidatePath("/", "layout");
  }
  redirect("/admin/radio-schedule?notice=deleted");
}
