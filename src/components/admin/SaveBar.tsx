import Link from "next/link";
import { admin } from "@/content/admin-en";
import { ActionBar, FormStatus } from "./ActionBar";
import { Icon, type IconName } from "./Icon";
import { button } from "./ui";

// The Save (and optional Cancel) bar at the bottom of a form, so Save is always in reach.
export function SaveBar({
  label,
  pendingLabel,
  pending,
  icon = "save",
  cancelHref,
  dirty,
  disabled,
}: {
  label: string;
  pendingLabel: string;
  pending: boolean;
  icon?: IconName;
  cancelHref?: string;
  dirty: boolean;
  disabled?: boolean;
}) {
  return (
    <ActionBar status={<FormStatus dirty={dirty} />}>
      {cancelHref && (
        <Link href={cancelHref} className={button.ghost}>
          {admin.common.cancel}
        </Link>
      )}
      <button type="submit" disabled={pending || disabled} className={`${button.primary} flex-1 sm:flex-none`}>
        <Icon name={icon} className="h-5 w-5" />
        {pending ? pendingLabel : label}
      </button>
    </ActionBar>
  );
}
