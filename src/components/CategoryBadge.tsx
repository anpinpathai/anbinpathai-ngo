import type { ColorKey } from "@/content/ta-LK";
import { categoryColor } from "@/lib/category-colors";

export function CategoryBadge({ name, colorKey }: { name: string; colorKey: ColorKey }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-2xl px-3 py-0.5 text-sm font-semibold ${categoryColor[colorKey].soft}`}
    >
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${categoryColor[colorKey].dot}`} />
      {name}
    </span>
  );
}
