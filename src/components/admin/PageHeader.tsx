import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export function PageHeader({
  title,
  description,
  icon,
  back,
  actions,
  stackActions = false,
}: {
  title: string;
  description?: string;
  icon?: IconName;
  back?: { href: string; label: string };
  actions?: ReactNode;
  // On a phone, give the buttons the whole row (so they can each be full width) instead of sharing the title's row.
  stackActions?: boolean;
}) {
  return (
    <header className="mb-6">
      {back && (
        <Link
          href={back.href}
          className="-my-2 mb-1 inline-flex items-center gap-1.5 py-2 text-sm font-semibold text-muted transition-colors hover:text-brand"
        >
          <Icon name="arrowLeft" className="h-4 w-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {icon && (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
              <Icon name={icon} className="h-6 w-6" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight text-brand-dark sm:text-3xl">{title}</h1>
            {description && <p className="mt-1 text-muted">{description}</p>}
          </div>
        </div>
        {actions && (
          <div className={`flex flex-wrap items-center gap-3 ${stackActions ? "max-sm:w-full sm:ml-auto sm:justify-end" : ""}`}>{actions}</div>
        )}
      </div>
    </header>
  );
}
