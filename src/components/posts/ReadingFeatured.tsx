import Link from "next/link";
import { YouTubeEmbed } from "@/components/posts/Embeds";
import { pages } from "@/content/ta-LK";
import type { PostCardData } from "@/lib/post-types";

export function ReadingFeatured({ posts, channelUrl }: { posts: PostCardData[]; channelUrl?: string }) {
  const featured = posts.find((p) => p.youtubeId);
  if (!featured && !channelUrl) return null;

  const text = pages.reading;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
      <div className="grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
        {featured && (
          <div>
            <h2 className="mb-4 text-2xl text-brand">{text.featuredTitle}</h2>
            <YouTubeEmbed url={`https://www.youtube.com/watch?v=${featured.youtubeId}`} />
            <p className="mt-4 text-sm text-muted">{featured.dateText}</p>
            <h3 className="mt-1 text-xl">
              <Link href={`/posts/${featured.slug}`} className="underline-offset-4 hover:underline">
                {featured.title}
              </Link>
            </h3>
          </div>
        )}
        {channelUrl && (
          <div className="rounded-2xl bg-cat-blue/5 p-6">
            <p className="font-heading text-xl font-bold text-cat-blue">{text.channelText}</p>
            <div className="mt-5">
              <a
                href={channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-cat-blue px-6 py-2.5 font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {text.channelButton}
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
