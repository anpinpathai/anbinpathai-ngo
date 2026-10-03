import type { Metadata } from "next";
import { CategoryListing } from "@/components/posts/CategoryListing";
import { ReadingFeatured } from "@/components/posts/ReadingFeatured";
import { t } from "@/content/ta-LK";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "வாசிப்போம் சுவாசிப்போம்", description: t.home.blurbs.reading };

export default async function ReadingPage() {
  const channelUrl = (await getSettings()).youtube_url?.trim() || undefined;

  return (
    <CategoryListing
      slug="reading"
      page={1}
      basePath="/reading"
      renderFeatured={(posts) => <ReadingFeatured posts={posts} channelUrl={channelUrl} />}
    />
  );
}
