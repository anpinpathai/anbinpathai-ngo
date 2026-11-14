"use client";

import { SaveBar } from "@/components/admin/SaveBar";
import { directoryAdmin } from "@/content/admin-directory-en";
import type { DirectoryFieldRow } from "@/lib/directory/config";
import type { EntryFormAction, EntryFormState } from "@/lib/directory/form-state";
import { FORM_UI_EN } from "@/lib/directory/ui-text";
import { EntryStepsForm } from "./EntryStepsForm";

const detail = directoryAdmin.detail;

// One person's answers inside the admin panel: the numbered steps of the "Add a person" page, free to jump between, with
// the admin's Save bar always in view. (A small wrapper, because a server page cannot hand a function to the form, but
// this client file can define it.)
export function AdminEntryForm({
  fields,
  initial,
  action,
  hidden,
  photoUrl,
  saveLabel,
  savingLabel,
  cancelHref,
}: {
  fields: readonly DirectoryFieldRow[];
  initial: EntryFormState;
  action: EntryFormAction;
  hidden?: Record<string, string>;
  photoUrl: string | null;
  saveLabel: string;
  savingLabel: string;
  cancelHref: string;
}) {
  return (
    <EntryStepsForm
      fields={fields}
      initial={initial}
      action={action}
      mode="admin"
      ui={FORM_UI_EN}
      uploadUrl="/api/admin/upload"
      photoUrl={photoUrl}
      hidden={hidden}
      labels={{
        steps: detail.stepsLabel,
        step: "Step",
        previous: detail.previousStep,
        next: detail.nextStep,
        problem: detail.stepHasProblem,
      }}
      actions={({ pending, dirty }) => (
        <SaveBar label={saveLabel} pendingLabel={savingLabel} pending={pending} cancelHref={cancelHref} dirty={dirty} />
      )}
    />
  );
}
