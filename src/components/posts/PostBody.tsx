import { linkifyLine, toParagraphs } from "@/lib/post-render";

export function PostBody({ text }: { text: string }) {
  const paragraphs = toParagraphs(text);
  if (paragraphs.length === 0) return null;

  return (
    <div className="space-y-5 text-lg leading-loose">
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
