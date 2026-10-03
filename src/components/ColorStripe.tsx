import { categories } from "@/content/ta-LK";
import { categoryColor } from "@/lib/category-colors";

export function ColorStripe() {
  return (
    <div aria-hidden="true" className="flex h-1.5 w-full">
      {categories.map((c) => (
        <span key={c.slug} className={`flex-1 ${categoryColor[c.colorKey].dot}`} />
      ))}
    </div>
  );
}
