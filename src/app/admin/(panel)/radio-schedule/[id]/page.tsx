import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { admin } from "@/content/admin-en";
import { getProgramme } from "@/lib/radio-schedule";
import type { ProgrammeFormValues } from "@/lib/radio-schedule-form";
import { requireAdmin } from "@/lib/session";
import { ProgrammeForm } from "../ProgrammeForm";

export default async function EditProgrammePage(props: PageProps<"/admin/radio-schedule/[id]">) {
  await requireAdmin();

  const id = Number((await props.params).id);
  if (!Number.isInteger(id)) notFound();

  const programme = await getProgramme(id);
  if (!programme) notFound();

  const initialValues: ProgrammeFormValues = {
    id: String(programme.id),
    title: programme.title,
    kind: programme.kind,
    date: programme.onDate ?? "",
    weekday: programme.weekday === null ? "" : String(programme.weekday),
    startTime: programme.startTime,
    endTime: programme.endTime ?? "",
  };

  return (
    <>
      <PageHeader
        title={admin.radioSchedule.editProgramme}
        description="Change the details, then press Save programme."
        icon="calendar"
        back={{ href: "/admin/radio-schedule", label: admin.radioSchedule.backToList }}
      />
      <ProgrammeForm initialValues={initialValues} isEdit />
    </>
  );
}
