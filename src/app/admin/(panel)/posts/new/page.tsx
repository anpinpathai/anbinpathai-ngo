import { admin } from "@/content/admin-en";
import { listCategories } from "@/lib/posts";
import { todayInput, type PostFormValues } from "@/lib/post-form";
import { requireAdmin } from "@/lib/session";
import { PostComposer } from "../PostComposer";

export default async function NewPostPage() {
  await requireAdmin();
  const categories = await listCategories();

  const initialValues: PostFormValues = {
    id: "",
    text: "",
    categoryId: "",
    photoKeys: [],
    youtubeUrl: "",
    facebookUrl: "",
    publishDate: todayInput(),
  };

  return (
    <>
      <h1 className="mb-6 text-center text-3xl text-brand">{admin.posts.newPost}</h1>
      <PostComposer
        initialValues={initialValues}
        categories={categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name }))}
        initialPhotos={[]}
        status="new"
      />
    </>
  );
}
