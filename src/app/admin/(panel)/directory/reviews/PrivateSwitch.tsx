"use client";

import { directoryAdmin } from "@/content/admin-directory-en";
import { Switch } from "../fields/controls";

const text = directoryAdmin.reviews;

// "Reviewer can see private details", the same switch in the "Add" and the "Edit" window.
export function PrivateSwitch({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-0.5">
        <Switch checked={checked} onChange={onChange} label={text.canSeePrivate} />
      </span>
      <span>
        <span className="block font-semibold text-ink">{text.canSeePrivate}</span>
        <span className="block text-sm text-muted">{text.canSeePrivateHelp}</span>
      </span>
    </div>
  );
}
