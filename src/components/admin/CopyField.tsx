"use client";

import { useState } from "react";
import { copyText } from "@/lib/clipboard";
import { Icon } from "./Icon";
import { button } from "./ui";

// A line of text with a Copy button, for a link or a password. A secret (the password) shows as dots until Show is pressed.
export function CopyField({
  label,
  value,
  secret = false,
  copyLabel,
  copiedLabel,
  showLabel,
  hideLabel,
}: {
  label: string;
  value: string;
  secret?: boolean;
  copyLabel: string;
  copiedLabel: string;
  showLabel?: string;
  hideLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState(false);
  const hidden = secret && !shown;

  return (
    <div>
      <p className="text-sm font-semibold text-ink">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        {/* On a phone a long link is cut to one line (the Copy button is what matters there, and a tap selects all of it);
            from "sm" it is shown in full. */}
        <code
          title={hidden ? undefined : value}
          className={`min-w-0 flex-1 select-all rounded-xl border border-line bg-panel px-3 py-2 text-sm text-ink max-sm:truncate ${
            hidden ? "tracking-widest" : "[overflow-wrap:anywhere]"
          }`}
        >
          {hidden ? "••••••••" : value}
        </code>
        {secret && (
          <button
            type="button"
            onClick={() => setShown((v) => !v)}
            aria-label={shown ? hideLabel : showLabel}
            title={shown ? hideLabel : showLabel}
            className={`${button.icon} max-sm:!h-10 max-sm:!w-10`}
          >
            <Icon name={shown ? "eyeOff" : "eye"} className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={async () => {
            if (await copyText(value)) {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            }
          }}
          className={`${button.small} h-10 shrink-0 sm:h-9`}
        >
          <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
    </div>
  );
}
