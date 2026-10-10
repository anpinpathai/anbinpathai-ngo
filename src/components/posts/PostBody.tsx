import { linkifyLine, toParagraphs } from "@/lib/post-render";

export function PostBody({ text }: { text: string }) {
  const paragraphs = toParagraphs(text);
  if (paragraphs.length === 0) return null;

  return (
    // Body text, close to a news page like Virakesari: about 16px on a phone and 17px on a computer,
    // 1.75 line spacing, left-aligned (ragged right edge, like Virakesari), and 1.5rem (about 28px) between paragraphs.
    <div className="space-y-6 text-left text-[0.85rem] leading-[1.75] sm:text-[0.9rem]">
      {paragraphs.map((lines, i) => (
        <p key={i}>
          {lines.map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {linkifyLine(line).map((part, k) =>
                part.href ? (
                  <a
                    key={k}
                    href={part.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="break-all font-semibold text-brand underline underline-offset-4"
                  >
                    {part.text}
                  </a>
                ) : (
                  <span key={k}>{part.text}</span>
                ),
              )}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}
