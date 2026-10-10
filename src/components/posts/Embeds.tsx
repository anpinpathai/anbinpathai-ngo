import { postText } from "@/content/ta-LK";
import { facebookEmbed } from "@/lib/post-render";
import { parseYoutubeId } from "@/lib/youtube";

export function YouTubeEmbed({ url }: { url: string }) {
  const id = parseYoutubeId(url);
  if (!id) return null;

  return (
    <div>
      <div className="aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={postText.video}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full"
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block py-2 text-sm font-semibold text-brand underline-offset-4 hover:underline"
      >
        {postText.watchOnYoutube}
      </a>
    </div>
  );
}

export function FacebookEmbed({ url }: { url: string }) {
  const { src, kind } = facebookEmbed(url);

  return (
    <div>
      <div className="mx-auto max-w-[500px] overflow-hidden rounded-2xl bg-white">
        <iframe
          src={src}
          title={postText.facebookPost}
          loading="lazy"
          allow="encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          scrolling="no"
          className={`w-full border-0 ${kind === "video" ? "aspect-video" : "h-[560px]"}`}
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block py-2 text-center text-sm font-semibold text-brand underline-offset-4 hover:underline"
      >
        {postText.viewOnFacebook}
      </a>
    </div>
  );
}
