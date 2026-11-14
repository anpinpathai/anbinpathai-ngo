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
  compact = false,
  action,
}: {
  title: string;
  lead?: ReactNode;
  crumb?: string;
  icon?: ReactNode;
  tint?: string;
  titleClass?: string;
  // A shorter heading block (less space above and below, a smaller title), for working pages such as the Registry list.
  compact?: boolean;
  // A button for the heading. On a wide screen it stands at the right edge, level with the title, so it needs no row of its own;
  // on a phone it comes under the text.
  action?: ReactNode;
}) {
  return (
    <section className={tint}>
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 ${compact ? "py-5 sm:py-6" : "py-8 sm:py-12"} ${
          action ? "sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-6" : ""
        }`}
      >
        <nav aria-label={postText.home} className={`text-sm text-muted ${action ? "sm:col-span-2" : ""}`}>
          <Link href="/" className="-my-1.5 inline-block py-1.5 underline-offset-4 hover:underline">
            {postText.home}
          </Link>
          <span aria-hidden="true"> › </span>
          <span>{crumb ?? title}</span>
        </nav>
        <div className={`flex items-center gap-4 ${compact ? "mt-2.5" : "mt-4"} ${action ? "sm:col-start-1 sm:row-start-2 sm:self-center" : ""}`}>
          {icon}
          <h1 className={`min-w-0 [overflow-wrap:anywhere] ${compact ? "text-[1.35rem] sm:text-3xl" : "text-2xl sm:text-3xl lg:text-4xl"} ${titleClass}`}>{title}</h1>
        </div>
        {lead && (
          <div className={`max-w-3xl ${compact ? "mt-2 text-[0.95rem] leading-snug sm:text-base" : "mt-5 text-base sm:mt-6 sm:text-lg"} ${action ? "sm:col-span-2 sm:row-start-3" : ""}`}>
            {lead}
          </div>
        )}
        {action && <div className={`mt-3 sm:col-start-2 sm:row-start-2 sm:self-center ${compact ? "sm:mt-2.5" : "sm:mt-4"}`}>{action}</div>}
      </div>
    </section>
  );
}
