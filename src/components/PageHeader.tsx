import Link from "next/link";
import type { ReactNode } from "react";
import { postText } from "@/content/ta-LK";

export function PageHeader({
  title,
  lead,
  crumb,
  icon,
  tint = "bg-sand",
  titleClass = "text-brand",
}: {
  title: string;
  lead?: ReactNode;
  crumb?: string;
  icon?: ReactNode;
  tint?: string;
  titleClass?: string;
}) {
  return (
    <section className={tint}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <nav aria-label={postText.home} className="text-sm text-muted">
          <Link href="/" className="underline-offset-4 hover:underline">
            {postText.home}
          </Link>
          <span aria-hidden="true"> › </span>
          <span>{crumb ?? title}</span>
        </nav>
        <div className="mt-4 flex items-center gap-4">
          {icon}
          <h1 className={`min-w-0 text-2xl [overflow-wrap:anywhere] sm:text-3xl lg:text-4xl ${titleClass}`}>{title}</h1>
        </div>
        {lead && <div className="mt-6 max-w-3xl text-lg">{lead}</div>}
      </div>
    </section>
  );
}
