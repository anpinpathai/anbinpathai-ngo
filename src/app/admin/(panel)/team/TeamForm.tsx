"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { Field, describedBy, inputClass } from "@/components/admin/Field";
import { ImageUploader } from "@/components/admin/ImageUploader";
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="id" value={values.id} />

      <fieldset className="space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <legend className="px-2 font-heading text-xl font-bold text-brand">Member details</legend>

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

      <fieldset className="rounded-2xl border border-line bg-white p-5 sm:p-6">
        <legend className="px-2 font-heading text-xl font-bold text-brand">{text.photo}</legend>
        <p className="mb-3 text-sm text-muted">{text.photoHelp}</p>
        <ImageUploader
          name="photoKey"
          initialKey={values.photoKey}
          initialUrl={photoUrl}
          error={errors.photoKey}
          maxSide={800}
          shape="square"
        />
      </fieldset>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-4 border-t border-line bg-cream/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-8 py-2.5 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? admin.common.saving : isEdit ? text.save : text.create}
        </button>
        <Link href="/admin/team" className="font-semibold text-brand underline-offset-4 hover:underline">
          {admin.common.cancel}
        </Link>
        {state.message && (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={`font-semibold ${state.status === "error" ? "text-red-700" : "text-cat-green"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
