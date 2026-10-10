import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { FacebookEmbed, YouTubeEmbed } from "@/components/posts/Embeds";
import { PhotoGallery } from "@/components/posts/PhotoGallery";
import { PostBody } from "@/components/posts/PostBody";
import { PostCard } from "@/components/posts/PostCard";
import { ShareButtons } from "@/components/posts/ShareButtons";
import { categories, postText, t, type ColorKey } from "@/content/ta-LK";
import { formatDateTa } from "@/lib/format-date";
import { getPublishedPost, getRelated, listRecentSlugs } from "@/lib/public-posts";
import { splitTitleBody } from "@/lib/post-render";
import { publicUrl } from "@/lib/storage";
import { parseYoutubeId } from "@/lib/youtube";

const loadPost = cache(getPublishedPost);

export async function generateStaticParams() {
  return (await listRecentSlugs(50)).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/posts/[slug]">): Promise<Metadata> {
  const post = await loadPost((await props.params).slug);
  if (!post) return {};

  // Share picture: first photo, else the YouTube thumbnail, else the site default (from the layout).
  const youtubeId = post.youtubeUrl ? parseYoutubeId(post.youtubeUrl) : null;
  const cover =
    publicUrl(post.galleryKeys[0]) ??
    (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : undefined);
  const description = post.excerpt || post.title;
  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      locale: "ta_LK",
      siteName: t.siteName,
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
      images: [{ url: cover ?? "/og-default.jpg" }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function PostPage(props: PageProps<"/posts/[slug]">) {
  const post = await loadPost((await props.params).slug);
  if (!post) notFound();

  const meta = categories.find((c) => c.slug === post.categorySlug);
  const { rest } = splitTitleBody(post.body, post.title);
  const photos = post.galleryKeys.flatMap((key) => {
    const url = publicUrl(key);
    return url ? [url] : [];
  });
  const related = await getRelated(post.categoryId, post.id, 3);

  return (
    <main>
      <article className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <nav aria-label={postText.home} className="text-sm text-muted">
          <Link href="/" className="-my-1.5 inline-block py-1.5 underline-offset-4 hover:underline">
            {postText.home}
          </Link>
          <span aria-hidden="true"> › </span>
          {meta ? (
            <Link href={meta.href} className="-my-1.5 inline-block py-1.5 underline-offset-4 hover:underline">
              {post.categoryName}
            </Link>
          ) : (
            <span>{post.categoryName}</span>
          )}
        </nav>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <CategoryBadge name={post.categoryName} colorKey={post.categoryColor as ColorKey} />
          <time className="text-sm text-muted">{formatDateTa(post.publishedAt ?? post.createdAt)}</time>
        </div>

        {/* Headline, close to a news page like Virakesari: about 20px on a phone and 28px on a computer. */}
        <h1 className="mt-4 text-[1.06rem] leading-[1.5] sm:text-[1.48rem] sm:leading-[1.45]">{post.title}</h1>

        {/* Photos come first, straight after the headline, then the text, like a news page. */}
        {photos.length > 0 && (
          <div className="mt-6">
            <PhotoGallery photos={photos} />
          </div>
        )}
        {rest && (
          <div className={photos.length > 0 ? "mt-8" : "mt-6"}>
            <PostBody text={rest} />
          </div>
        )}
        {post.youtubeUrl && (
          <div className="mt-8">
            <YouTubeEmbed url={post.youtubeUrl} />
          </div>
        )}
        {post.facebookUrl && (
          <div className="mt-8">
            <FacebookEmbed url={post.facebookUrl} />
          </div>
        )}

        <div className="mt-10 border-t border-line pt-6">
          <ShareButtons title={post.title} />
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-sand">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
            <h2 className="text-xl text-brand sm:text-2xl">{postText.related}</h2>
            <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
