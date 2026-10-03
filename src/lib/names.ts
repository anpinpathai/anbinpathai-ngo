const graphemes = new Intl.Segmenter("ta", { granularity: "grapheme" });

export function initialOf(name: string) {
  const stripped = name.replace(/^(?:திருமதி|திரு|செல்வி|செல்வன்)[.\s]+/, "").trim();
  const [first] = graphemes.segment(stripped || name);
  return first?.segment ?? "?";
}
