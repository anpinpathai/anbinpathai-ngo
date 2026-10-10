import Link from "next/link";
import { t } from "@/content/ta-LK";
import { categoryColor } from "@/lib/category-colors";

export function InitiativesGrid() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {t.home.initiatives.map((item, index) => {
        const color = categoryColor[item.colorKey];
        const body = (
          <>
            <span
              aria-hidden="true"
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-semibold ${color.solid}`}
            >
              {index + 1}
            </span>
            <span className="min-w-0 font-semibold [overflow-wrap:anywhere]">{item.name}</span>
          </>
        );
        const cardClass = "flex items-center gap-4 rounded-xl border border-line bg-white p-4";
        return (
          <li key={item.name}>
            {"href" in item && item.href ? (
              <Link href={item.href} className={`${cardClass} transition hover:shadow-lg`}>
                {body}
              </Link>
            ) : (
              <div className={cardClass}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
