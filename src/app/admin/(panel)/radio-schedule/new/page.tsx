import { PageHeader } from "@/components/admin/PageHeader";
import { admin } from "@/content/admin-en";
import type { ProgrammeFormValues } from "@/lib/radio-schedule-form";
import { requireAdmin } from "@/lib/session";
import { ProgrammeForm } from "../ProgrammeForm";

export default async function NewProgrammePage() {
  await requireAdmin();

  const initialValues: ProgrammeFormValues = {
    id: "",
    title: "",
    kind: "once",
    date: "",
    weekday: "",
    startTime: "",
    endTime: "",
  };

  return (
    <>
      <PageHeader
        title={admin.radioSchedule.newProgramme}
        description="Add a programme to the schedule on the Radio page of your website."
        icon="calendar"
        back={{ href: "/admin/radio-schedule", label: admin.radioSchedule.backToList }}
      />
      <ProgrammeForm initialValues={initialValues} isEdit={false} />
    </>
  );
}
