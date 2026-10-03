import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryListing } from "@/components/posts/CategoryListing";
import { categories, t } from "@/content/ta-LK";

const activitySlugs = categories.filter((c) => c.slug !== "reading").map((c) => c.slug);

export function generateStaticParams() {
  return activitySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/activities/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  return {
    title: categories.find((c) => c.slug === slug)?.name,
    description: t.home.blurbs[slug as keyof typeof t.home.blurbs],
  };
}

export default async function ActivityPage(props: PageProps<"/activities/[slug]">) {
  const { slug } = await props.params;
  if (!activitySlugs.includes(slug)) notFound();
  return <CategoryListing slug={slug} page={1} basePath={`/activities/${slug}`} />;
}
