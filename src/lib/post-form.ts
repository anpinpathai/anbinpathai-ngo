import { admin } from "@/content/admin-en";
import { postFallbackTitles } from "@/content/ta-LK";
import { MAX_GALLERY_PHOTOS } from "@/lib/limits";
import type { PostInput } from "@/lib/posts";
import { makeExcerpt, makeTitle, MAX_POST_TEXT, normalizePostText } from "@/lib/post-text";
import { isValidKey } from "@/lib/storage";
import { FACEBOOK_HOSTS, isHttpsUrlOnHosts } from "@/lib/urls";
import { parseYoutubeId } from "@/lib/youtube";

export type PostIntent = "publish" | "draft";

export type PostFormValues = {
  id: string;
  text: string;
  categoryId: string;
  photoKeys: string[];
  youtubeUrl: string;
  facebookUrl: string;
  publishDate: string;
};

export type PostFormErrors = Partial<Record<keyof PostFormValues, string>>;

const dateFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo" });

export function toDateInput(date: Date | null) {
  return date ? dateFormat.format(date) : "";
}

export function todayInput() {
  return dateFormat.format(new Date());
}

function parseDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00+05:30`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function readPostForm(formData: FormData): { values: PostFormValues; intent: PostIntent } {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    intent: formData.get("intent") === "draft" ? "draft" : "publish",
    values: {
      id: text("id").trim(),
      text: text("text"),
      categoryId: text("categoryId"),
      photoKeys: formData.getAll("photoKeys").map(String),
      youtubeUrl: text("youtubeUrl"),
      facebookUrl: text("facebookUrl"),
      publishDate: text("publishDate"),
    },
  };
}

export function validatePost(
  raw: PostFormValues,
  validCategoryIds: number[],
  intent: PostIntent,
  existing: { publishedAt: Date | null } | null,
) {
  const errors: PostFormErrors = {};
  const messages = admin.posts.errors;

  const text = normalizePostText(raw.text);
  if (text.length > MAX_POST_TEXT) errors.text = messages.textTooLong(MAX_POST_TEXT);

  const categoryId = Number(raw.categoryId);
  if (!Number.isInteger(categoryId) || !validCategoryIds.includes(categoryId)) {
    errors.categoryId = messages.category;
  }

  const photoKeys = [...new Set(raw.photoKeys.map((k) => k.trim()).filter(Boolean))];
  if (photoKeys.length > MAX_GALLERY_PHOTOS) errors.photoKeys = messages.tooManyPhotos;
  else if (!photoKeys.every(isValidKey)) errors.photoKeys = messages.photos;

  const youtubeUrl = raw.youtubeUrl.trim();
  if (youtubeUrl && (youtubeUrl.length > 200 || !parseYoutubeId(youtubeUrl))) errors.youtubeUrl = messages.youtube;

  const facebookUrl = raw.facebookUrl.trim();
  if (facebookUrl && (facebookUrl.length > 500 || !isHttpsUrlOnHosts(facebookUrl, FACEBOOK_HOSTS))) {
    errors.facebookUrl = messages.facebook;
  }

  if (!text && photoKeys.length === 0 && !youtubeUrl && !facebookUrl && !errors.text) {
    errors.text = messages.text;
  }

  const publishDate = raw.publishDate.trim();
  const parsedDate = publishDate ? parseDateInput(publishDate) : null;
  if (publishDate && !parsedDate) errors.publishDate = messages.date;

  const values: PostFormValues = {
    id: raw.id,
    text,
    categoryId: raw.categoryId,
    photoKeys,
    youtubeUrl,
    facebookUrl,
    publishDate,
  };

  if (Object.keys(errors).length > 0) return { values, errors, input: null };

  const fallback = photoKeys.length > 0
    ? postFallbackTitles.photos
    : youtubeUrl || facebookUrl
      ? postFallbackTitles.video
      : postFallbackTitles.post;

  const published = intent === "publish";
  const input: PostInput = {
    title: makeTitle(text, fallback),
    categoryId,
    excerpt: makeExcerpt(text),
    body: text,
    galleryKeys: photoKeys,
    youtubeUrl: youtubeUrl || null,
    facebookUrl: facebookUrl || null,
    published,
    publishedAt: parsedDate ?? existing?.publishedAt ?? (published ? new Date() : null),
  };
  return { values, errors, input };
}
