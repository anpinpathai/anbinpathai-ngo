import { notFound } from "next/navigation";
import { admin } from "@/content/admin-en";
import { getPost, listCategories } from "@/lib/posts";
import { toDateInput, todayInput, type PostFormValues } from "@/lib/post-form";
import { requireAdmin } from "@/lib/session";
import { publicUrl } from "@/lib/storage";
import { PostComposer } from "../PostComposer";

export default async function EditPostPage(props: PageProps<"/admin/posts/[id]">) {
  await requireAdmin();

  const id = Number((await props.params).id);
  if (!Number.isInteger(id)) notFound();

  const [post, categories] = await Promise.all([getPost(id), listCategories()]);
  if (!post) notFound();

  const initialValues: PostFormValues = {
    id: String(post.id),
    text: post.body,
    categoryId: String(post.categoryId),
    photoKeys: post.galleryKeys,
    youtubeUrl: post.youtubeUrl ?? "",
    facebookUrl: post.facebookUrl ?? "",
    publishDate: toDateInput(post.publishedAt) || todayInput(),
  };

  return (
    <>
      <h1 className="mb-6 text-center text-3xl text-brand">{admin.posts.editPost}</h1>
      <PostComposer
        initialValues={initialValues}
        categories={categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name }))}
        initialPhotos={post.galleryKeys.flatMap((key) => {
          const url = publicUrl(key);
          return url ? [{ key, url }] : [];
        })}
        status={post.published ? "published" : "draft"}
      />
    </>
  );
}
