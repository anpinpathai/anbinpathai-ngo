"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Modal } from "@/components/admin/Modal";
import { button, inputClass } from "@/components/admin/ui";
import { useToast } from "@/components/toast/ToastProvider";
import { directoryAdmin } from "@/content/admin-directory-en";
import { admin } from "@/content/admin-en";
import { REVIEW_DAY_CHOICES_UI } from "@/lib/directory/review-ui";
import { Switch } from "../fields/controls";
import { updateReviewAction } from "./actions";
import { makePassword, PasswordField } from "./PasswordField";
import { PrivateSwitch } from "./PrivateSwitch";
import type { ReviewerView } from "./types";

const text = directoryAdmin.reviews;

// Change a reviewer: the name, who can see private details, how long the link works, and (if wanted) a new password or a
// new link. A reviewer made before the link and password could be looked at again starts with both ticked, so one press
// on Save fixes it.
export function EditReviewerDialog({ reviewer, onClose, onSaved }: { reviewer: ReviewerView; onClose: () => void; onSaved: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(reviewer.name);
  const [canSeePrivate, setCanSeePrivate] = useState(reviewer.canSeePrivate);
  const [days, setDays] = useState("keep");
  const [newLink, setNewLink] = useState(!reviewer.linkKept);
  const [password, setPassword] = useState(() => (reviewer.linkKept ? "" : makePassword()));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    if (!name.trim()) return setError(text.nameRequired);
    if (password && password.length < 8) return setError(text.passwordShort);
    // Without a kept password there is nothing to show later, so one is needed.
    if (!reviewer.linkKept && !password) return setError(text.passwordShort);

    startTransition(async () => {
      const result = await updateReviewAction({
        id: reviewer.id,
        reviewerName: name,
        canSeePrivate,
        days: days === "keep" ? null : Number(days),
        password,
        newLink,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      toast.success(text.saved);
      onSaved();
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal
      title={text.editTitle}
      onClose={onClose}
      closeLabel={text.close}
      onSubmit={save}
      footer={
        <>
          {error && (
            <p role="alert" className="mr-auto text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
          <button type="button" onClick={onClose} className={button.ghost}>
            {admin.common.cancel}
          </button>
          <button type="submit" disabled={pending} className={button.primary}>
            {pending ? text.saving : text.save}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {!reviewer.linkKept && <p className="rounded-xl bg-gold/20 p-3 text-sm font-semibold text-ink">{text.oldReviewer}</p>}

        <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
          <label className="block">
            <span className="font-semibold text-ink">{text.reviewerName}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus className={inputClass()} />
          </label>
          <label className="block">
            <span className="font-semibold text-ink">{text.days}</span>
            <select value={days} onChange={(e) => setDays(e.target.value)} className={`${inputClass()} select-arrow`}>
              <option value="keep">{text.keepDays(reviewer.expiresDate)}</option>
              {REVIEW_DAY_CHOICES_UI.map((n) => (
                <option key={n} value={n}>
                  {text.fromToday(n)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <PrivateSwitch checked={canSeePrivate} onChange={setCanSeePrivate} />

        <PasswordField id={`edit-reviewer-password-${reviewer.id}`} label={text.newPassword} help={text.newPasswordHelp} value={password} onChange={setPassword} />

        <div className="flex items-start gap-4">
          <span className="mt-0.5">
            <Switch checked={newLink} onChange={setNewLink} label={text.newLink} />
          </span>
          <span>
            <span className="block font-semibold text-ink">{text.newLink}</span>
            <span className="block text-sm text-muted">{text.newLinkHelp}</span>
          </span>
        </div>
      </div>
    </Modal>
  );
}
