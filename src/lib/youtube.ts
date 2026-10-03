export function parseYoutubeId(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else {
      const match = /^\/(?:embed|shorts|live)\/([^/]+)/.exec(url.pathname);
      id = match ? match[1] : null;
    }
  }

  return id && /^[\w-]{11}$/.test(id) ? id : null;
}
