"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { CopyField } from "@/components/admin/CopyField";
import { Icon } from "@/components/admin/Icon";
import { Modal } from "@/components/admin/Modal";
import { button, inputClass } from "@/components/admin/ui";
import { useToast } from "@/components/toast/ToastProvider";
import { directoryAdmin } from "@/content/admin-directory-en";
import { admin } from "@/content/admin-en";
import { REVIEW_DAY_CHOICES_UI } from "@/lib/directory/review-ui";
import { createReviewAction } from "./actions";
import { PasswordField } from "./PasswordField";
import { PrivateSwitch } from "./PrivateSwitch";

const text = directoryAdmin.reviews;

// The gold "Add a reviewer" button, and the window it opens. After the reviewer is made, the same window shows the
// link and the password, ready to copy.
export function AddReviewerButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${button.gold} border border-transparent max-sm:w-full`}>
        <Icon name="plus" className="h-5 w-5" />
        {text.add}
      </button>
      {open && <AddReviewerDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function AddReviewerDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [days, setDays] = useState("7");
  const [password, setPassword] = useState("");
  const [canSeePrivate, setCanSeePrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [made, setMade] = useState<{ link: string; password: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function create(event: FormEvent) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    if (!name.trim()) return setError(text.nameRequired);
    if (password.length < 8) return setError(text.passwordShort);

    startTransition(async () => {
      const result = await createReviewAction({ reviewerName: name, password, days: Number(days), canSeePrivate });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMade({ link: result.link, password: result.password });
      toast.success(text.doneTitle);
      router.refresh();
    });
  }

  if (made) {
    return (
      <Modal
        title={text.doneTitle}
        onClose={onClose}
        closeLabel={text.close}
        footer={
          <button type="button" onClick={onClose} className={button.primary}>
            {text.done}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="rounded-xl bg-gold/20 p-3 text-sm font-semibold text-ink">{text.doneHelp}</p>
          <CopyField label={text.linkLabel} value={made.link} copyLabel={text.copy} copiedLabel={text.copied} />
          <CopyField
            label={text.passwordLabel}
            value={made.password}
            secret
            copyLabel={text.copy}
            copiedLabel={text.copied}
            showLabel={text.show}
            hideLabel={text.hide}
          />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={text.addTitle}
      onClose={onClose}
      closeLabel={text.close}
      onSubmit={create}
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
            {pending ? text.creating : text.create}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
          <label className="block">
            <span className="font-semibold text-ink">{text.reviewerName}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoFocus className={inputClass()} />
          </label>
          <label className="block">
            <span className="font-semibold text-ink">{text.days}</span>
            <select value={days} onChange={(e) => setDays(e.target.value)} className={`${inputClass()} select-arrow`}>
              {REVIEW_DAY_CHOICES_UI.map((n) => (
                <option key={n} value={n}>
                  {text.daysOption(n)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <PasswordField id="add-reviewer-password" label={text.password} help={text.passwordHelp} value={password} onChange={setPassword} required />

        <PrivateSwitch checked={canSeePrivate} onChange={setCanSeePrivate} />
      </div>
    </Modal>
  );
}
