"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { admin } from "@/content/admin-en";
import { createPost, deletePost, getPost, listCategories, setPublished, updatePost } from "@/lib/posts";
import { readPostForm, validatePost, type PostFormErrors, type PostFormValues } from "@/lib/post-form";
import { requireAdmin } from "@/lib/session";
import { deleteObjects } from "@/lib/storage";

export type PostFormState = {
  status: "idle" | "saved" | "error";
  message?: string;
  values: PostFormValues;
  errors: PostFormErrors;
};

function safeReturnPath(value: FormDataEntryValue | null) {
  const path = String(value ?? "");
  return path.startsWith("/admin/posts") && !path.startsWith("//") ? path : "/admin/posts";
}

export async function savePostAction(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  await requireAdmin();

  const { values: raw, intent } = readPostForm(formData);
  const id = raw.id ? Number(raw.id) : null;

  const existing = id ? await getPost(id) : null;
  if (id && !existing) {
    return { status: "error", message: admin.posts.errors.notFound, values: raw, errors: {} };
  }

  const categoryRows = await listCategories();
  const { values, errors, input } = validatePost(
    raw,
    categoryRows.map((c) => c.id),
    intent,
    existing,
  );
  if (!input) return { status: "error", message: admin.common.fixErrors, values, errors };

  try {
    if (id && existing) {
      if (!(await updatePost(id, input))) {
        return { status: "error", message: admin.posts.errors.notFound, values, errors: {} };
      }
      const keep = new Set(input.galleryKeys);
      await deleteObjects(existing.galleryKeys.filter((k) => !keep.has(k)));
    } else {
      await createPost(input);
    }
  } catch (err) {
    console.error("Saving post failed:", err);
    return { status: "error", message: admin.common.actionFailed, values, errors: {} };
  }

  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/posts?notice=${input.published ? "posted" : "draftsaved"}`);
  return { status: "saved", message: admin.posts.composer.saved, values, errors: {} };
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) {
    const removed = await deletePost(id);
    if (removed) await deleteObjects(removed.galleryKeys);
    revalidatePath("/", "layout");
  }
  redirect("/admin/posts?notice=deleted");
}

export async function togglePublishAction(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const publish = formData.get("publish") === "true";
  if (Number.isInteger(id)) {
    await setPublished(id, publish);
    revalidatePath("/", "layout");
  }
  // Back to the same list (same tab and page), with a notice that the page shows as a toast.
  const back = safeReturnPath(formData.get("returnTo"));
  redirect(`${back}${back.includes("?") ? "&" : "?"}notice=${publish ? "published" : "unpublished"}`);
}
