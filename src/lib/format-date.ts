import { months } from "@/content/ta-LK";

const parts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Colombo",
  day: "numeric",
  month: "numeric",
  year: "numeric",
});

export function formatDateTa(date: Date) {
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.formatToParts(date).find((p) => p.type === type)?.value);
  return `${get("day")} ${months[get("month") - 1]} ${get("year")}`;
}
