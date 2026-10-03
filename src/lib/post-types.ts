import type { ColorKey } from "@/content/ta-LK";

export type PostCardData = {
  id: number;
  slug: string;
  title: string;
  snippet: string;
  coverUrl: string | null;
  coverIsVideo: boolean;
  youtubeId: string | null;
  dateText: string;
  photoCount: number;
  hasVideo: boolean;
  hasFacebook: boolean;
  categorySlug: string;
  categoryName: string;
  categoryColor: ColorKey;
};

export type LatestTab = {
  slug: string;
  name: string;
  colorKey: ColorKey;
  href: string;
  posts: PostCardData[];
};
