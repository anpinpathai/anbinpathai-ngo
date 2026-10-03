"use client";

import { useActionState, useState } from "react";
import { Icon, type IconName } from "@/components/admin/Icon";
import { button, inputBase } from "@/components/admin/ui";
import { admin } from "@/content/admin-en";
import { login } from "../actions";

// A small icon on the left inside an input.
function Leading({ icon }: { icon: IconName }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 grid w-12 place-items-center text-muted">
      <Icon name={icon} className="h-5 w-5" />
    </span>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="mt-6 space-y-5">
      <div>
        <label htmlFor="username" className="font-semibold text-ink">
          {admin.login.username}
        </label>
        <div className="relative mt-1.5">
          <Leading icon="user" />
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            required
            maxLength={100}
            className={`${inputBase} border-line pl-12`}
          />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="font-semibold text-ink">
          {admin.login.password}
        </label>
        <div className="relative mt-1.5">
          <Leading icon="lock" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            maxLength={200}
            className={`${inputBase} border-line pl-12 pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? admin.login.hidePassword : admin.login.showPassword}
            title={showPassword ? admin.login.hidePassword : admin.login.showPassword}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted transition-colors hover:text-brand"
          >
            <Icon name={showPassword ? "eyeOff" : "eye"} className="h-5 w-5" />
          </button>
        </div>
      </div>
      {state?.error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          <Icon name="alert" className="mt-0.5 h-4 w-4" />
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${button.primary} w-full py-3 text-lg`}>
        {pending ? admin.login.pending : admin.login.submit}
      </button>
    </form>
  );
}
