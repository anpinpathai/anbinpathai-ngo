import { radio } from "@/content/ta-LK";
import { rowParts, type ProgrammeTiming } from "@/lib/radio-schedule-format";

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="mt-[0.2em] h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
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
//
// The row picks its layout from its own width ("@container"), not from the screen:
// - Narrow (a phone, a tablet held upright, the admin preview): a stacked card that uses the whole width.
//     [ date chip ........................ அடுத்தது ]
//     Heading
//     Day
//     [ clock  time, on its own full-width bar ]
// - Wide (about 790px or more, so a computer): a single line.
//     [ date block ]  Heading [அடுத்தது] ............ [ clock time ]
//                     Day
// Type and spacing grow a little once the card is about 530px wide ("@md:").
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
    <div className="@container">
      <div
        className={`flex flex-col gap-2.5 rounded-2xl border bg-white p-3 @md:p-4 @2xl:flex-row @2xl:items-center @2xl:gap-4 ${
          highlight ? "border-brand shadow-sm" : "border-line"
        }`}
      >
        {/* Narrow: the date chip on the left and the "next" tag on the right. Wide: this wrapper disappears ("contents"). */}
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 @2xl:contents">
          <div
            className={`flex shrink-0 items-baseline gap-1.5 rounded-full px-3 py-1.5 text-center @2xl:h-[4.75rem] @2xl:w-[5.5rem] @2xl:flex-col @2xl:items-center @2xl:justify-center @2xl:gap-0 @2xl:rounded-xl @2xl:px-1 @2xl:py-0 ${
              highlight ? "bg-brand text-white" : "bg-sand text-brand"
            }`}
          >
            {weekly ? (
              <>
                <span className="whitespace-nowrap text-[0.95rem] font-bold leading-none @2xl:text-[0.95rem]">
                  {parts.weekdayShort}
                </span>
                <span className="whitespace-nowrap text-[0.74rem] leading-none opacity-80 @2xl:mt-2 @2xl:text-[0.7rem]">
                  {radio.schedule.weekly}
                </span>
              </>
            ) : (
              <>
                <span className={`text-[1.05rem] font-bold leading-none @2xl:text-2xl ${highlight ? "text-gold" : ""}`}>
                  {parts.day}
                </span>
                <span className="whitespace-nowrap text-[0.78rem] leading-none opacity-90 @2xl:mt-1.5 @2xl:text-[0.7rem]">
                  {parts.month}
                </span>
              </>
            )}
          </div>

          {showNext && (
            <span className="rounded-full bg-gold px-2.5 py-0.5 text-[0.7rem] font-bold leading-snug text-brand @2xl:hidden">
              {radio.schedule.next}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 @2xl:flex @2xl:items-center @2xl:justify-between @2xl:gap-5">
          <div className="min-w-0">
            <p className="text-base font-semibold leading-snug [overflow-wrap:anywhere] @md:text-lg">
              {title}
              {showNext && (
                <span className="ml-2.5 hidden whitespace-nowrap rounded-full bg-gold px-2.5 py-0.5 align-[0.1em] text-xs font-bold leading-snug text-brand @2xl:inline-block">
                  {radio.schedule.next}
                </span>
              )}
            </p>
            <p className="mt-0.5 text-[0.8rem] leading-snug text-muted [overflow-wrap:anywhere] @md:text-sm">
              {parts.dayText}
            </p>
          </div>

          <p className="mt-2.5 flex w-full items-start gap-2 rounded-lg bg-brand/5 px-3 py-2 text-[0.85rem] font-semibold leading-snug text-brand @md:inline-flex @md:w-fit @md:max-w-full @md:text-sm @2xl:mt-0 @2xl:w-auto @2xl:max-w-[18rem] @2xl:shrink-0 @2xl:gap-1.5 @2xl:py-1.5">
            <ClockIcon />
            <span className="min-w-0 [overflow-wrap:anywhere]">{parts.timeText}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
