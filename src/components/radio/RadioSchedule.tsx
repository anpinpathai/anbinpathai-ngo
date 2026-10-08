import { radio } from "@/content/ta-LK";
import type { SiteProgramme } from "@/lib/radio-schedule";
import { ProgrammeRow } from "./ProgrammeRow";

// The programme schedule on the Radio page, right under the player and above "நீங்கள் கேட்கலாம்". Hidden when there is nothing to show.
export function RadioSchedule({ programmes }: { programmes: SiteProgramme[] }) {
  if (programmes.length === 0) return null;
  const text = radio.schedule;

  return (
    <section aria-labelledby="schedule-title">
      <h2 id="schedule-title" className="text-2xl text-brand">
        {text.title}
      </h2>
      <p className="mt-1 text-sm text-muted">{text.note}</p>
      <ul className="mt-4 space-y-3">
        {programmes.map((p, index) => (
          <li key={p.id}>
            <ProgrammeRow
              title={p.title}
              timing={p}
              date={p.next}
              highlight={index === 0}
              showNext={index === 0}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
