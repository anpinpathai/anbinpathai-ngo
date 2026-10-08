import { radio } from "@/content/ta-LK";
import { rowParts, type ProgrammeTiming } from "@/lib/radio-schedule-format";

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="mt-[0.3em] h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

// One programme on the Radio page. The admin form shows the very same row as a preview.
// `date` is the day to show (a weekly programme shows its next day).
export function ProgrammeRow({
  title,
  timing,
  date,
  highlight = false,
  showNext = false,
}: {
  title: string;
  timing: ProgrammeTiming;
  date: string;
  highlight?: boolean;
  showNext?: boolean;
}) {
  const parts = rowParts(timing, date);
  const weekly = timing.kind === "weekly";

  return (
    <div
      className={`flex items-center gap-3.5 rounded-2xl border bg-white p-3 sm:gap-4 sm:p-4 ${
        highlight ? "border-brand shadow-sm" : "border-line"
      }`}
    >
      <div
        className={`flex h-[4.25rem] w-[4.5rem] shrink-0 flex-col items-center justify-center rounded-xl text-center ${
          highlight ? "bg-brand text-white" : "bg-sand text-brand"
        }`}
      >
        {weekly ? (
          <>
            <span className="text-xl font-bold leading-none">{parts.weekdayShort}</span>
            <span className="mt-1.5 text-[0.7rem] leading-none opacity-80">{radio.schedule.weekly}</span>
          </>
        ) : (
          <>
            <span className={`text-2xl font-bold leading-none ${highlight ? "text-gold" : ""}`}>{parts.day}</span>
            <span className="mt-1.5 text-[0.7rem] leading-none opacity-90">{parts.month}</span>
          </>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold leading-snug [overflow-wrap:anywhere]">{title}</p>
        <p className="mt-0.5 flex items-start gap-1.5 text-sm leading-snug text-muted">
          <ClockIcon />
          <span className="[overflow-wrap:anywhere]">{parts.line}</span>
        </p>
      </div>

      {showNext && (
        <span className="shrink-0 self-start rounded-full bg-gold px-3 py-1 text-xs font-bold leading-snug text-brand sm:self-center">
          {radio.schedule.next}
        </span>
      )}
    </div>
  );
}
