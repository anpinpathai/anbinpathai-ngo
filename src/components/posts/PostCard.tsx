import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "@/components/CategoryBadge";
import { CategoryIcon } from "@/components/CategoryIcon";
import { postText } from "@/content/ta-LK";
import { categoryColor } from "@/lib/category-colors";
import type { PostCardData } from "@/lib/post-types";

export function PostCard({ post, className = "" }: { post: PostCardData; className?: string }) {
  const color = categoryColor[post.categoryColor];

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border border-line border-t-4 bg-white transition hover:shadow-lg ${color.topBorder} ${className}`}
    >
      <div className={`relative aspect-[4/3] ${color.tint}`}>
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 80vw"
            className="object-cover"
          />
        ) : (
          <div className={`grid h-full place-items-center ${color.text}`}>
            <CategoryIcon slug={post.categorySlug} className="h-14 w-14 opacity-60" />
          </div>
        )}
        {post.coverIsVideo && (
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center"
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-black/65 text-white">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                <path d="M8 5v14l11-7L8 5Z" />
              </svg>
            </span>
          </span>
        )}
        {(post.photoCount > 1 || post.hasVideo) && (
          <div className="absolute bottom-2 right-2 flex gap-1.5 text-xs font-semibold text-white">
            {post.photoCount > 1 && (
              <span className="rounded-full bg-black/65 px-2.5 py-0.5">{postText.photos(post.photoCount)}</span>
            )}
            {post.hasVideo && <span className="rounded-full bg-black/65 px-2.5 py-0.5">{postText.video}</span>}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CategoryBadge name={post.categoryName} colorKey={post.categoryColor} />
          <time className="text-xs text-muted">{post.dateText}</time>
        </div>
        <h3 className="mt-3 line-clamp-2 text-lg text-ink">
          <Link href={`/posts/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        {post.snippet && <p className="mt-2 line-clamp-3 text-sm text-muted">{post.snippet}</p>}
        <span className={`mt-auto pt-4 text-sm font-semibold ${color.text}`}>{postText.readMore} →</span>
      </div>
    </article>
  );
}
