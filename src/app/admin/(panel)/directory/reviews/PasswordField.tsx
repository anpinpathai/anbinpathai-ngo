"use client";

import { useState } from "react";
import { Icon } from "@/components/admin/Icon";
import { button, inputClass } from "@/components/admin/ui";
import { directoryAdmin } from "@/content/admin-directory-en";

const text = directoryAdmin.reviews;

// Letters and digits that cannot be mistaken for each other (no 0/O, 1/l/I).
export function makePassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const numbers = new Uint32Array(12);
  crypto.getRandomValues(numbers);
  return Array.from(numbers, (n) => alphabet[n % alphabet.length]).join("");
}

// The password box of the "Add a reviewer" and "Edit" windows: type one, or let the site make one.
export function PasswordField({
  id,
  label,
  help,
  value,
  onChange,
  required = false,
}: {
  id: string;
  label: string;
  help: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const [shown, setShown] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="font-semibold text-ink">
        {label}
      </label>
      <p className="text-sm text-muted">{help}</p>
      {/* On a phone the box and the eye share a row and "Make one for me" has its own row below; from "sm" all three are in one row. */}
      <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex">
        <input
          id={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={100}
          autoComplete="new-password"
          required={required}
          className={`${inputClass()} !mt-0 min-w-0 flex-1`}
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? text.hide : text.show}
          title={shown ? text.hide : text.show}
          className={`${button.icon} !h-[3.1rem] !w-[3.1rem] !rounded-xl`}
        >
          <Icon name={shown ? "eyeOff" : "eye"} className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            onChange(makePassword());
            setShown(true);
          }}
          className={`${button.secondary} !py-3 max-sm:col-span-2`}
        >
          <Icon name="key" className="h-4 w-4" />
          {text.generate}
        </button>
      </div>
    </div>
  );
}
