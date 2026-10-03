"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

// A submit button that shows a "please wait" label and cannot be pressed twice.
export function SubmitButton({
  children,
  pendingLabel,
  className,
  title,
}: {
  children: ReactNode;
  pendingLabel?: string;
  className: string;
  title?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} title={title} className={className}>
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
