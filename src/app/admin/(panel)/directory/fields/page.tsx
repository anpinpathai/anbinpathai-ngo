import { NoticeToast } from "@/components/admin/NoticeToast";
import { directoryAdmin } from "@/content/admin-directory-en";
import { SECTIONS } from "@/lib/directory/config";
import { listFields } from "@/lib/directory/fields";
import { directoryEnabled } from "@/lib/directory/text";
import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { FieldsManager } from "./FieldsManager";

const text = directoryAdmin.fields;

export default async function DirectoryFieldsPage(props: PageProps<"/admin/directory/fields">) {
  await requireAdmin();

  const sp = await props.searchParams;
  const deleted = (Array.isArray(sp.notice) ? sp.notice[0] : sp.notice) === "deleted";
  // The group (tab) to open, kept in the address so a reload or a redirect comes back to the same group.
  const tabParam = Array.isArray(sp.tab) ? sp.tab[0] : sp.tab;
  const initialTab = SECTIONS.find((s) => s.key === tabParam)?.key;

  const [fields, settings] = await Promise.all([listFields(), getSettings()]);

  return (
    <>
      {deleted && <NoticeToast message={text.deleted} />}
      <FieldsManager fields={fields} initialTab={initialTab} previewHref={directoryEnabled(settings) ? "/directory/register" : null} />
    </>
  );
}
