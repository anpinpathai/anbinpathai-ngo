"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { Field, describedBy, inputClass } from "@/components/admin/Field";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { SaveBar } from "@/components/admin/SaveBar";
import { useUnsavedChanges } from "@/components/admin/UnsavedChanges";
import { card } from "@/components/admin/ui";
import { admin, roleGroupEnglish } from "@/content/admin-en";
import { roleGroups } from "@/content/ta-LK";
import type { MemberFormValues } from "@/lib/member-form";
import { saveMemberAction, type MemberFormState } from "./actions";

export function TeamForm({
  initialValues,
  photoUrl,
  isEdit,
}: {
  initialValues: MemberFormValues;
  photoUrl: string | null;
  isEdit: boolean;
}) {
  const initial: MemberFormState = { status: "idle", values: initialValues, errors: {} };
  const [state, action, pending] = useActionState(saveMemberAction, initial);
  const { values, errors } = state;
  const [roleGroup, setRoleGroup] = useState(initialValues.roleGroup);
  const text = admin.team.form;

  // "Edited" means something changed since the last result from the server.
  const [editedAt, setEditedAt] = useState<MemberFormState | null>(null);
  const dirty = editedAt === state;
  useUnsavedChanges(dirty);
  const markEdited = () => setEditedAt(state);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <form onSubmit={handleSubmit} onInput={markEdited}>
      <input type="hidden" name="id" value={values.id} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
        <fieldset className={`${card} min-w-0 space-y-5 p-5 sm:p-6`}>
          <legend className="sr-only">{text.detailsTitle}</legend>
          <h2 className="text-lg font-bold text-brand-dark" aria-hidden="true">
            {text.detailsTitle}
          </h2>

          <Field id="name" label={text.name} help={text.nameHelp} error={errors.name}>
            <input
              id="name"
              name="name"
              type="text"
              lang="ta"
              required
              maxLength={120}
              defaultValue={values.name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy("name", text.nameHelp, errors.name)}
              className={inputClass(errors.name)}
            />
          </Field>

          <Field id="roleGroup" label={text.group} error={errors.roleGroup}>
            <select
              id="roleGroup"
              name="roleGroup"
              required
              value={roleGroup}
              onChange={(e) => setRoleGroup(e.target.value)}
              aria-invalid={Boolean(errors.roleGroup)}
              aria-describedby={describedBy("roleGroup", undefined, errors.roleGroup)}
              className={inputClass(errors.roleGroup)}
            >
              {roleGroups.map((g) => (
                <option key={g.key} value={g.key}>
                  {roleGroupEnglish[g.key]} ({g.heading})
                </option>
              ))}
            </select>
          </Field>

          <Field id="roleTitle" label={text.roleTitle} help={text.roleTitleHelp} error={errors.roleTitle}>
            <input
              id="roleTitle"
              name="roleTitle"
              type="text"
              lang="ta"
              maxLength={60}
              defaultValue={values.roleTitle}
              aria-invalid={Boolean(errors.roleTitle)}
              aria-describedby={describedBy("roleTitle", text.roleTitleHelp, errors.roleTitle)}
              className={inputClass(errors.roleTitle)}
            />
          </Field>

          <Field id="subtitle" label={text.subtitle} help={text.subtitleHelp} error={errors.subtitle}>
            <input
              id="subtitle"
              name="subtitle"
              type="text"
              lang="ta"
              maxLength={100}
              defaultValue={values.subtitle}
              aria-invalid={Boolean(errors.subtitle)}
              aria-describedby={describedBy("subtitle", text.subtitleHelp, errors.subtitle)}
              className={inputClass(errors.subtitle)}
            />
          </Field>
        </fieldset>

        <fieldset className={`${card} min-w-0 p-5 sm:p-6`}>
          <legend className="sr-only">{text.photo}</legend>
          <h2 className="text-lg font-bold text-brand-dark" aria-hidden="true">
            {text.photo}
          </h2>
          <p className="mb-4 mt-1 text-sm text-muted">{text.photoHelp}</p>
          <ImageUploader
            name="photoKey"
            initialKey={values.photoKey}
            initialUrl={photoUrl}
            error={errors.photoKey}
            maxSide={800}
            shape="square"
            onChange={markEdited}
          />
        </fieldset>
      </div>

      <SaveBar
        label={isEdit ? text.save : text.create}
        pendingLabel={admin.common.saving}
        pending={pending}
        cancelHref="/admin/team"
        message={state.message}
        status={state.status}
        dirty={dirty}
      />
    </form>
  );
}
