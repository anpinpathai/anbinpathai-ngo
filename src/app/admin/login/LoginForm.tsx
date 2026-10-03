"use client";

import { useActionState } from "react";
import { admin } from "@/content/admin-en";
import { login } from "../actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="mt-6 space-y-5">
      <div>
        <label htmlFor="username" className="font-semibold">
          {admin.login.username}
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          required
          maxLength={100}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className="font-semibold">
          {admin.login.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          className={inputClass}
        />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand px-6 py-2.5 font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? admin.login.pending : admin.login.submit}
      </button>
    </form>
  );
}
