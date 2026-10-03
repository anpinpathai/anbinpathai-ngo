import { PageHeader } from "@/components/admin/PageHeader";
import { admin } from "@/content/admin-en";
import type { ColorKey } from "@/content/ta-LK";
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
      <PageHeader
        title={admin.posts.newPost}
        description="Write your news, add photos if you like, then press Post."
        icon="edit"
        back={{ href: "/admin/posts", label: admin.posts.backToPosts }}
      />
      <PostComposer
        initialValues={initialValues}
        categories={categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, colorKey: c.colorKey as ColorKey }))}
        initialPhotos={[]}
        status="new"
      />
    </>
  );
}
