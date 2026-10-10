import type { ContentGroup } from "@/content/ta-LK";

export function ContentGroups({ groups, dotClass }: { groups: readonly ContentGroup[]; dotClass: string }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {groups.map((group, index) => (
        <section key={index} className="rounded-2xl border border-line bg-white p-6">
          {group.title && <h2 className="text-xl text-ink">{group.title}</h2>}
          {group.chips ? (
            <ul className={`flex flex-wrap gap-2 ${group.title ? "mt-4" : ""}`}>
              {group.items.map((item) => (
                <li key={item} className="rounded-full bg-sand px-4 py-1.5 font-semibold text-ink">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <ul className={`space-y-2 ${group.title ? "mt-4" : ""}`}>
              {group.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span aria-hidden="true" className={`mt-3 h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`} />
                  <span className="min-w-0 [overflow-wrap:anywhere]">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
