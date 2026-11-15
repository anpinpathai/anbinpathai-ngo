// Dates in the Registry (the "Date" kind of question, for example the date of birth). No secrets and no database here, so it
// is safe to use in the browser as well as on the server.
//
// A date is saved as "1985-03-21" (year-month-day): the same text a date box sends, easy to sort, and not tied to a time zone.

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const ONE_DAY = 24 * 60 * 60 * 1000;

type Limits = {
  // A date of birth (or any date that has already happened) cannot be later than today. One day of leeway is allowed,
  // because Sri Lanka is ahead of the server's clock.
  notInFuture?: boolean;
  now?: Date;
};

// Reads a date from the date box ("1985-03-21") or typed by hand ("21-03-1985", "21/3/1985", "21.03.1985") and gives
// "1985-03-21". Gives null when it is not a real date (for example 31 February), is before 1900, or is too far ahead.
export function normalizeDate(input: string, { notInFuture = false, now = new Date() }: Limits = {}): string | null {
  const text = input.trim();

  let year: number;
  let month: number;
  let day: number;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  const hand = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(text);
  if (iso) {
    [year, month, day] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  } else if (hand) {
    [day, month, year] = [Number(hand[1]), Number(hand[2]), Number(hand[3])];
  } else {
    return null;
  }

  if (year < MIN_YEAR || year > MAX_YEAR || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  // "31 February" would roll over into March: that is not a real date.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  if (notInFuture && date.getTime() > now.getTime() + ONE_DAY) return null;

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// "1985-03-21" -> "21 மார்ச் 1985" (the website's Sri Lankan Tamil). Anything else is returned as it is.
export function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ta-LK", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}
