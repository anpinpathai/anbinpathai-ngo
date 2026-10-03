export function splitTitleBody(body: string, title: string) {
  const lines = body.split("\n");
  const firstIndex = lines.findIndex((l) => l.trim() !== "");
  if (firstIndex === -1) return { heading: title, rest: "" };

  const firstLine = lines[firstIndex].replace(/\s+/g, " ").trim();
  if (firstLine !== title) return { heading: title, rest: body.trim() };

  return { heading: title, rest: lines.slice(firstIndex + 1).join("\n").trim() };
}

export function snippetAfterTitle(title: string, excerpt: string) {
  const plainTitle = title.replace(/…$/, "");
  const trimmed = excerpt.startsWith(plainTitle) ? excerpt.slice(plainTitle.length) : excerpt;
  return trimmed.replace(/^[\s:–-]+/, "").trim();
}

export function toParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((block) => block.split("\n"))
    .filter((lines) => lines.some((l) => l.trim() !== ""));
}

const URL_PATTERN = /(https?:\/\/[^\s<]+)/g;

export type TextPart = { text: string; href?: string };

export function linkifyLine(line: string): TextPart[] {
  const parts: TextPart[] = [];
  for (const piece of line.split(URL_PATTERN)) {
    if (!piece) continue;
    if (!/^https?:\/\//.test(piece)) {
      parts.push({ text: piece });
      continue;
    }
    const trailing = /[.,;:!?)\]}”’"']+$/.exec(piece)?.[0] ?? "";
    const url = trailing ? piece.slice(0, -trailing.length) : piece;
    parts.push({ text: url, href: url });
    if (trailing) parts.push({ text: trailing });
  }
  return parts;
}

export function facebookEmbed(url: string) {
  const isVideo = /\/videos\/|fb\.watch|\/reel\/|\/watch\//.test(url);
  const kind = isVideo ? "video" : "post";
  return {
    kind,
    src: `https://www.facebook.com/plugins/${kind}.php?href=${encodeURIComponent(url)}&show_text=true&width=500`,
  };
}
