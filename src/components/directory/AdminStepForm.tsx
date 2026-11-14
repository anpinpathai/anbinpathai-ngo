"use client";

import { useState } from "react";
import { useUnsavedChanges } from "@/components/admin/UnsavedChanges";
import { admin } from "@/content/admin-en";
import type { DirectoryFieldRow } from "@/lib/directory/config";
import type { EntryFormAction, EntryFormState } from "@/lib/directory/form-state";
import { FORM_UI_EN } from "@/lib/directory/ui-text";
import { RegistrationForm } from "./RegistrationForm";

// The admin's "Add a person" form: the same numbered steps (1 - 2 - 3 ...) that visitors fill in, but in English and in
// the admin's look. (A small wrapper, because a server page cannot hand a function to the form, but this client file can.)
export function AdminStepForm({
  fields,
  initial,
  action,
  cancelHref,
  publishLabel,
  submitLabel,
  sendingLabel,
}: {
  fields: readonly DirectoryFieldRow[];
  initial: EntryFormState;
  action: EntryFormAction;
  cancelHref: string;
  publishLabel: string;
  submitLabel: string;
  sendingLabel: string;
}) {
  const [edited, setEdited] = useState(false);
  // Ask before leaving the page when answers were typed but not saved.
  useUnsavedChanges(edited);

  return (
    <RegistrationForm
      fields={fields}
      initial={initial}
      action={action}
      ui={FORM_UI_EN}
      uploadUrl="/api/admin/upload"
      admin={{ cancelHref, cancelLabel: admin.common.cancel, publishLabel, submitLabel, sendingLabel }}
      onEdited={() => setEdited(true)}
    />
  );
}
