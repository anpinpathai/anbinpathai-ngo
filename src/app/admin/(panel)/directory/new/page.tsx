import { AdminStepForm } from "@/components/directory/AdminStepForm";
import { PageHeader } from "@/components/admin/PageHeader";
import { directoryAdmin } from "@/content/admin-directory-en";
import { listFields } from "@/lib/directory/fields";
import type { EntryFormState } from "@/lib/directory/form-state";
import { requireAdmin } from "@/lib/session";
import { createEntryAction } from "../actions";

const text = directoryAdmin;

export default async function NewDirectoryEntryPage() {
  await requireAdmin();

  const fields = await listFields();
  const initial: EntryFormState = { status: "idle", values: {}, shares: {}, errors: {} };

  return (
    <>
      <PageHeader title={text.create.title} icon="users" back={{ href: "/admin/directory", label: text.detail.back }} />
      <AdminStepForm
        fields={fields}
        initial={initial}
        action={createEntryAction}
        cancelHref="/admin/directory"
        publishLabel={text.create.publishNow}
        submitLabel={text.create.save}
        sendingLabel={text.create.saving}
      />
    </>
  );
}
