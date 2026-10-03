export const MAX_POST_TEXT = 10_000;

export function normalizePostText(raw: string) {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cut(text: string, max: number) {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice).trimEnd()}…`;
}

export function makeTitle(text: string, fallback: string) {
  const firstLine = text.split("\n").find((line) => line.trim() !== "") ?? "";
  const cleaned = firstLine.replace(/\s+/g, " ").trim();
  return cleaned ? cut(cleaned, 100) : fallback;
}

export function makeExcerpt(text: string) {
  return cut(text.replace(/\s+/g, " ").trim(), 200);
}
