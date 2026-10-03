import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryListing } from "@/components/posts/CategoryListing";
import { categories } from "@/content/ta-LK";

const activitySlugs = categories.filter((c) => c.slug !== "reading").map((c) => c.slug);

export function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: PageProps<"/activities/[slug]/page/[n]">): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: categories.find((c) => c.slug === slug)?.name };
}

export default async function ActivityPagedPage(props: PageProps<"/activities/[slug]/page/[n]">) {
  const { slug, n } = await props.params;
  const page = Number(n);
  if (!activitySlugs.includes(slug) || !Number.isInteger(page) || page < 2) notFound();
  return <CategoryListing slug={slug} page={page} basePath={`/activities/${slug}`} />;
}
