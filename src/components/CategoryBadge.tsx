import type { ColorKey } from "@/content/ta-LK";
import { categoryColor } from "@/lib/category-colors";

export function CategoryBadge({ name, colorKey }: { name: string; colorKey: ColorKey }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-2 rounded-2xl px-3 py-0.5 text-sm font-semibold ${categoryColor[colorKey].soft}`}
    >
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${categoryColor[colorKey].dot}`} />
      {/* Section names are Tamil. A snug line height keeps the tag slim. */}
      <span lang="ta" className="min-w-0 leading-snug!">
        {name}
      </span>
    </span>
  );
}
