import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryListing } from "@/components/posts/CategoryListing";

export const metadata: Metadata = { title: "வாசிப்போம் சுவாசிப்போம்" };

export function generateStaticParams() {
  return [];
}

export default async function ReadingPagedPage(props: PageProps<"/reading/page/[n]">) {
  const page = Number((await props.params).n);
  if (!Number.isInteger(page) || page < 2) notFound();
  return <CategoryListing slug="reading" page={page} basePath="/reading" />;
}
