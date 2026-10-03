import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { admin } from "@/content/admin-en";
import type { ColorKey } from "@/content/ta-LK";
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
      <PageHeader
        title={admin.posts.editPost}
        description={post.published ? "This post is live on your website." : "This post is a draft. Visitors cannot see it yet."}
        icon="edit"
        back={{ href: "/admin/posts", label: admin.posts.backToPosts }}
      />
      <PostComposer
        initialValues={initialValues}
        categories={categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, colorKey: c.colorKey as ColorKey }))}
        initialPhotos={post.galleryKeys.flatMap((key) => {
          const url = publicUrl(key);
          return url ? [{ key, url }] : [];
        })}
        status={post.published ? "published" : "draft"}
      />
    </>
  );
}
